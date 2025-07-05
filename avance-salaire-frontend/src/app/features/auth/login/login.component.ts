import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class LoginComponent {
  loginData: LoginData = {
    email: '',
    password: ''
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulation d'une requête de connexion
    setTimeout(() => {
      this.isLoading = false;
      
      // Exemple de validation simple (à remplacer par votre logique d'authentification)
      if (this.loginData.email === 'admin@soprahr.com' && this.loginData.password === 'password') {
        this.successMessage = 'Connexion réussie ! Redirection en cours...';
        
        // Redirection après succès (à adapter selon votre routing)
        setTimeout(() => {
          // Router navigation logic here
          console.log('Redirect to dashboard');
        }, 1500);
      } else {
        this.errorMessage = 'Email ou mot de passe incorrect. Veuillez réessayer.';
      }
    }, 2000);
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
}