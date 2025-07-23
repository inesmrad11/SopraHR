// project import
import { Component } from '@angular/core';
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
export class AuthLoginComponent {
  loginData: LoginData = {
    email: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    if (this.isLoading) return;
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const loginRequest: LoginRequest = {
      email: this.loginData.email,
      password: this.loginData.password
    };
    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Connexion réussie ! Redirection en cours...';
        setTimeout(() => {
          const user = this.authService.getCurrentUser();
          if (user?.role === 'ADMIN') {
            this.router.navigate(['/dashboard/default']);
          } else if (user?.role === 'HR_EXPERT') {
            this.router.navigate(['/hr/dashboard']);
          } else if (user?.role === 'EMPLOYEE') {
            this.router.navigate(['/employee/employee-home']);
          } else {
            this.router.navigate(['/employee/employee-home']);
          }
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
      }
    });
  }
}
