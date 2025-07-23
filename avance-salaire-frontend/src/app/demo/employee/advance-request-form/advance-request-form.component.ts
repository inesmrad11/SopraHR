import { Component, OnInit, ViewChild, AfterViewInit, Renderer2, ElementRef } from '@angular/core';import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, NgIf } from '@angular/common';

// Services
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { AuthService } from '../../../core/services/auth.service';

// Models
import { User } from '../../../core/models/user.model';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';

// Enums
import { RequestStatus } from '../../../core/models/request-status.enum';

// Ajout des imports Angular Material
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-advance-request-form',
  templateUrl: './advance-request-form.component.html',
  styleUrls: ['./advance-request-form.component.scss'],
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    
    // Angular Material
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  providers: [DatePipe]
})
export class AdvanceRequestFormComponent implements OnInit, AfterViewInit {
  steps = ['Montant', 'Date', 'Raison', 'Remboursement'];
  currentStep = 1;
  submitted = false;
  reasonLength = 0;
  minDate: string = '';
  maxDate: string = '';
  monthlyAmount = 0;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  currentUser: User | null = null;
  userSalary = 0;
  cumulNonRembourse = 0;
  hasPendingRequest = false;

  get maxAdvanceAmount(): number {
    // Plafond dynamique : 2 * salaire - cumul non remboursé
    return Math.max(0, (this.userSalary * 2) - this.cumulNonRembourse);
  }

  get minRepaymentMonths(): number {
    const amount = this.advanceForm.get('requestedAmount')?.value || 0;
    if (amount > this.userSalary) return 2;
    return 1;
  }

  get maxRepaymentMonths(): number {
    // Ne pas dépasser 6 mois ni le 31 décembre
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    return Math.min(6, 12 - currentMonth);
  }

  selectedRepaymentMonths = 3; // Valeur par défaut
  advanceForm!: FormGroup;
  currencySymbol = 'TND';

  formattedMinDate: string = '';
  formattedMaxDate: string = '';

  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('stepper', { read: ElementRef }) stepperRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private salaryAdvanceService: SalaryAdvanceService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // 2 months in advance
    this.maxDate = maxDate.toISOString().split('T')[0];
    // Only initialize the form ONCE here
    this.advanceForm = this.fb.group({
      requestedAmount: ['', [Validators.required, Validators.min(100), Validators.max(this.maxAdvanceAmount), Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      neededDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      repaymentMonths: [3, [Validators.required, Validators.min(1), Validators.max(6)]]
    });
  }

  ngOnInit(): void {
    // Format dates for display
    this.formattedMinDate = this.formatDateForDisplay(this.minDate);
    this.formattedMaxDate = this.formatDateForDisplay(this.maxDate);
    // Then load user data and update form validation
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user && user.salary) {
          this.userSalary = user.salary;
          // Update form validation with the new max amount
          this.advanceForm.get('requestedAmount')?.setValidators([
            Validators.required,
            Validators.min(100),
            Validators.max(this.maxAdvanceAmount),
            Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')
          ]);
          this.advanceForm.get('requestedAmount')?.updateValueAndValidity();
        } else {
          // Debug: show warning if salary is missing
          // Fallback: set maxAdvanceAmount to 5000 if salary is missing or zero
          // Consider disabling the form or showing a warning to the user in the template
          // this.maxAdvanceAmount = 5000; // This line is removed
          console.warn('User salary is missing or zero. Max advance amount set to 5000.');
        }
      },
      error: (err) => {
        console.error('Error loading user data', err);
        this.errorMessage = 'Erreur lors du chargement de vos informations. Veuillez réessayer.';
      }
    });
    this.updatePaymentSummary();
    this.updateCharacterCount();
    // Charger le cumul non remboursé (à adapter selon ton service)
    this.salaryAdvanceService.getMyRequests().subscribe({
      next: (requests) => {
        // DEBUG : afficher les statuts pour vérification
        console.log('Statuts des demandes employé:', requests.map(r => r.status));
        // Cumul = seulement les APPROUVÉES non remboursées
        this.cumulNonRembourse = requests
          ?.filter(req => req.status === RequestStatus.APPROVED)
          .reduce((sum, req) => sum + (req.totalAvancesNonRemboursees || 0), 0) || 0;
        // Blocage si une PENDING existe (correction)
        this.hasPendingRequest = Array.isArray(requests) && requests.some(req => req.status === RequestStatus.PENDING);
        if (!this.hasPendingRequest) {
          console.log('Aucune demande PENDING trouvée, le formulaire doit être accessible.');
        }
      }
    });
    // Ajout du validateur personnalisé
    this.advanceForm.setValidators([
      (group: AbstractControl): ValidationErrors | null => {
        const amount = group.get('requestedAmount')?.value;
        const months = group.get('repaymentMonths')?.value;
        const salary = this.userSalary;
        const plafond = this.maxAdvanceAmount;
        const now = new Date();
        const lastMonth = now.getMonth() + Number(months);
        const maxMonth = 12; // décembre
        if (amount > plafond) {
          return { plafondDepasse: true };
        }
        if (months > 6) {
          return { dureeMaxDepassee: true };
        }
        if (amount > salary && months < 2) {
          return { minDeuxMois: true };
        }
        if (lastMonth > maxMonth) {
          return { remboursementFinAnnee: true };
        }
        return null;
      }
    ]);
  }

  /**
   * Validator: Si le montant demandé atteint le plafond, la période doit être >= 2 mois
   */
  validateMinRepaymentIfFullCeiling(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const requestedAmount = group.get('requestedAmount')?.value;
      const months = group.get('repaymentMonths')?.value;
      const availableCeiling = this.maxAdvanceAmount;
      if (
        requestedAmount &&
        availableCeiling &&
        Number(requestedAmount) === Number(availableCeiling) &&
        Number(months) < 2
      ) {
        return { minRepaymentIfFullCeiling: true };
      }
      return null;
    };
  }

  /**
   * Retourne les options de remboursement valides (1 à 6, mais 1 désactivé si requestedAmount == plafond)
   */
  getAvailableRepaymentOptions(): { value: number, disabled: boolean }[] {
    const options = [];
    const requestedAmount = this.advanceForm.get('requestedAmount')?.value;
    const availableCeiling = this.maxAdvanceAmount;
    for (let i = 1; i <= 6; i++) {
      let disabled = false;
      if (Number(requestedAmount) === Number(availableCeiling) && i === 1) {
        disabled = true;
      }
      options.push({ value: i, disabled });
    }
    return options;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setStepperProgressVars();
      if (this.stepper) {
        this.stepper.selectionChange.subscribe(() => {
          this.setStepperProgressVars();
        });
      }
    });
  }

  setStepperProgressVars(): void {
    let el: HTMLElement | null = null;
    if (this.stepperRef && this.stepperRef.nativeElement) {
      el = this.stepperRef.nativeElement.closest('.mat-horizontal-stepper');
    }
    if (!el) {
      el = document.querySelector('.mat-horizontal-stepper');
    }
    if (!el || !this.stepper) return;
    
    const steps = this.stepper._steps.length;
    const active = this.stepper.selectedIndex;
    
    // Set data attribute for progressive fill
    el.setAttribute('data-active-step', active.toString());
    
    // Optional: Set CSS custom properties as well
    el.style.setProperty('--mat-horizontal-stepper-steps', steps.toString());
    el.style.setProperty('--mat-horizontal-stepper-active-step', (active + 1).toString());
  }

  // Calculate monthly installment amount
  calculateMonthlyInstallment(amount: number): number {
    if (!amount || amount <= 0) return 0;
    const months = this.advanceForm?.get('repaymentMonths')?.value || this.selectedRepaymentMonths;
    const monthly = amount / months;
    // Arrondir à 2 décimales
    return Math.round(monthly * 100) / 100;
  }

  // Get monthly payment amount
  get monthlyPayment(): number {
    const amount = this.advanceForm?.get('requestedAmount')?.value;
    if (!amount) return 0;
    return this.calculateMonthlyInstallment(amount);
  }

  // Update selected installment months
  updateRepaymentMonths(months: number): void {
    // Respecter min/max dynamiques
    let min = this.minRepaymentMonths;
    let max = this.maxRepaymentMonths;
    months = Math.max(min, Math.min(max, Number(months)));
    this.selectedRepaymentMonths = months;
    this.advanceForm.get('repaymentMonths')?.setValue(months);
  }

  nextStep() {
    this.submitted = true;
    if (this.currentStep === 1 && this.advanceForm.get('requestedAmount')?.invalid) return;
    if (this.currentStep === 2 && this.advanceForm.get('neededDate')?.invalid) return;
    if (this.currentStep === 3 && this.advanceForm.get('reason')?.invalid) return;
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
      this.submitted = false;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  updateCharacterCount() {
    this.reasonLength = this.advanceForm.get('reason')?.value?.length || 0;
  }

  updatePaymentSummary() {
    const amount = parseFloat(this.advanceForm.get('requestedAmount')?.value) || 0;
    const installments = parseInt(this.advanceForm.get('repaymentMonths')?.value) || 1;
    this.monthlyAmount = installments > 0 ? amount / installments : 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.advanceForm.invalid || !this.currentUser) {
      this.errorMessage = 'Veuillez remplir correctement le formulaire';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const formData = this.advanceForm.value;
    // Format neededDate en YYYY-MM-DD
    const neededDate = formData.neededDate ? formData.neededDate.split('T')[0] : '';
    const requestData = {
      requestedAmount: Number(formData.requestedAmount),
      reason: formData.reason,
      neededDate: neededDate,
      repaymentMonths: Number(formData.repaymentMonths)
    };
    this.salaryAdvanceService.createRequest(requestData).subscribe({
      next: (response) => {
        console.log('Request successful:', response);
        this.successMessage = 'Votre demande d\'avance a été soumise avec succès !';
        this.advanceForm.reset();
        setTimeout(() => {
          this.router.navigate(['/employee/advance-request-list']);
        }, 2000);
      },
      error: (error: Error) => {
        console.error('Error submitting request:', error);
        // UX : message plafond explicite
        if (error.message && error.message.includes('plafond autorisé')) {
          this.errorMessage = error.message;
        } else {
        this.errorMessage = error.message || 'Une erreur est survenue lors de la soumission de votre demande. Veuillez réessayer.';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Format date for display
  private formatDateForDisplay(date: Date | string): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  // Format date for display (legacy, kept for compatibility)
  private formatDate(date: Date | string): string {
    if (!date) return '';
    return this.formatDateForDisplay(date);
  }

  // Get error message for form controls
  getErrorMessage(field: string): string {
    const control = this.advanceForm.get(field);
    if (!control?.errors) return '';
    
    if (control.errors['required']) {
      return 'Ce champ est obligatoire.';
    }
    
    if (control.errors['min']) {
      return `Le montant minimum est de ${control.errors['min'].min} ${this.currencySymbol}.`;
    }
    
    if (control.errors['max']) {
      return `Le montant ne peut pas dépasser ${this.maxAdvanceAmount.toFixed(2)} ${this.currencySymbol} (2x votre salaire moins le cumul non remboursé).`;
    }
    
    if (control.errors['minlength']) {
      return `La raison doit contenir au moins ${control.errors['minlength'].requiredLength} caractères.`;
    }
    
    if (control.errors['maxlength']) {
      return `La raison ne doit pas dépasser ${control.errors['maxlength'].requiredLength} caractères.`;
    }
    
    if (control.errors['pattern']) {
      return 'Veuillez entrer un montant valide (ex: 1000.50).';
    }
    
    if (this.advanceForm.errors?.['plafondDepasse']) {
      return 'Le montant demandé dépasse le plafond autorisé (2x votre salaire moins le cumul non remboursé).';
    }
    if (this.advanceForm.errors?.['dureeMaxDepassee']) {
      return 'La durée de remboursement ne peut pas dépasser 6 mois.';
    }
    if (this.advanceForm.errors?.['minDeuxMois']) {
      return 'Si le montant demandé dépasse votre salaire mensuel, vous devez rembourser sur au moins 2 mois.';
    }
    if (this.advanceForm.errors?.['remboursementFinAnnee']) {
      return 'Toutes les avances doivent être remboursées avant le 31 décembre de l\'année en cours.';
    }
    
    return 'Valeur invalide.';
    
    return 'Veuillez vérifier ce champ.';
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/employee/dashboard']);
    }
  }
}
