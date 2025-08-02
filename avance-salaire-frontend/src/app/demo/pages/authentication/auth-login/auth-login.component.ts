// project import
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from 'src/app/core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent implements AfterViewInit {
  @ViewChild('videoWrapper', { static: false }) videoWrapper!: ElementRef;
  @ViewChild('loginContent', { static: false }) loginContent!: ElementRef;

  loginData: LoginData = {
    email: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';
  showSuccessOverlay = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    // Animation d'entrée pour le logo et le formulaire
    setTimeout(() => {
      const logo = document.querySelector('.auth-login-logo');
      const card = document.querySelector('.auth-form .card');
      
      if (logo) {
        logo.classList.add('animate-in');
      }
      if (card) {
        card.classList.add('animate-in');
      }
    }, 100);
  }

  onSubmit() {
    if (this.isLoading) return;
    
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.shakeForm();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginData.email,
      password: this.loginData.password
    };

    // Ajouter la classe loading au bouton
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.classList.add('loading');
    }

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Enlever la classe loading
        if (submitButton) {
          submitButton.classList.remove('loading');
        }

        // Démarrer la transition blur
        this.startSuccessTransition();
        
        // Redirection après la transition
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          if (user?.role === 'HR_EXPERT') {
            this.router.navigate(['/hr/dashboard']);
          } else if (user?.role === 'EMPLOYEE') {
            this.router.navigate(['/employee/employee-home']);
          } else {
            this.router.navigate(['/employee/employee-home']);
          }
        }, 1500); // Durée de la transition
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        
        // Enlever la classe loading
        if (submitButton) {
          submitButton.classList.remove('loading');
        }
        
        // Animation d'erreur
        this.shakeForm();
      }
    });
  }

  private startSuccessTransition() {
    // Phase 1: Commencer la transition de l'arrière-plan vers le blanc
    if (this.videoWrapper) {
      this.videoWrapper.nativeElement.classList.add('success-transition');
    }
    
    // Phase 2: Fade out du contenu de login
    setTimeout(() => {
      if (this.loginContent) {
        this.loginContent.nativeElement.classList.add('success-fade');
      }
    }, 200);

    // Phase 3: Afficher la boule de lumière
    setTimeout(() => {
      this.showSuccessOverlay = true;
    }, 600);
  }

  private shakeForm() {
    const card = document.querySelector('.auth-form .card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => {
        card.classList.remove('shake');
      }, 600);
    }
  }

  // Méthode pour gérer les animations d'entrée des champs
  onInputFocus(event: any) {
    const formGroup = event.target.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('focused');
    }
  }

  onInputBlur(event: any) {
    const formGroup = event.target.closest('.form-group');
    if (formGroup && !event.target.value) {
      formGroup.classList.remove('focused');
    }
  }
}