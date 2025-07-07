import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  loginData: LoginData = {
    email: '',
    password: ''
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  environment = environment; // Make environment available in template

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLoading) return;

    // Validate form
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Validate reCAPTCHA if required (only in production)
    if (environment.production && !this.captchaResolved) {
      this.errorMessage = 'Veuillez compléter le reCAPTCHA.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginData.email,
      password: this.loginData.password,
      recaptchaToken: environment.production ? (this.captchaToken || undefined) : undefined
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Connexion réussie ! Redirection en cours...';
        
        // Redirect based on user role
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          console.log('Decoded user:', user); // Debug log
          
          if (user?.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (user?.role === 'HR_MANAGER') {
            this.router.navigate(['/hr/dashboard']);
          } else if (user?.role === 'EMPLOYEE') {
            this.router.navigate(['/employee/dashboard']);
          } else {
            console.log('Unknown role:', user?.role, '- redirecting to employee dashboard');
            this.router.navigate(['/employee/dashboard']);
          }
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
        console.error('Login failed:', error);
      }
    });
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    // Logique pour mot de passe oublié
    console.log('Forgot password clicked');
  }

  onCreateAccount(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  captchaResolved = false;
  captchaToken: string | null = null;

  ngAfterViewInit() {
    // Only render reCAPTCHA in production
    if (environment.production) {
      // Ensure grecaptcha is available
      const grecaptcha: any = (window as any)['grecaptcha'];
      if (grecaptcha) {
        grecaptcha.render(document.querySelector('.g-recaptcha'), {
          sitekey: environment.recaptchaSiteKey,
          callback: (token: string) => this.onCaptchaResolved(token),
          'expired-callback': () => this.onCaptchaExpired(),
          'error-callback': () => this.onCaptchaError()
        });
      }
    } else {
      // In development, mark captcha as resolved
      this.captchaResolved = true;
    }
  }

  onCaptchaResolved(token: string | null) {
    this.captchaResolved = !!token;
    this.captchaToken = token;
  }

  onCaptchaExpired() {
    this.captchaResolved = false;
    this.captchaToken = null;
  }

  onCaptchaError() {
    this.captchaResolved = false;
    this.captchaToken = null;
    this.errorMessage = 'Erreur de reCAPTCHA. Veuillez réessayer.';
  }
}