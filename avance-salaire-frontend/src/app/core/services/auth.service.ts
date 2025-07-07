import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  /**
   * Login user with email and password
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/auth/login`;
    
    return this.http.post<LoginResponse>(url, loginData).pipe(
      tap(response => {
        this.handleSuccessfulLogin(response);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => this.handleLoginError(error));
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');
    
    // Update subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }

  /**
   * Get HTTP headers with authentication token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/auth/refresh`;
    const headers = this.getAuthHeaders();
    
    return this.http.post<LoginResponse>(url, {}, { headers }).pipe(
      tap(response => {
        this.setToken(response.token, this.isTokenInLocalStorage());
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Send OTP for 2FA
   */
  sendOtp(email: string): Observable<any> {
    const url = `${environment.apiUrl}/auth/send-otp`;
    return this.http.post(url, { email });
  }

  /**
   * Verify OTP for 2FA
   */
  verifyOtp(email: string, otp: string): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/auth/verify-otp`;
    return this.http.post<LoginResponse>(url, { email, otp }).pipe(
      tap(response => {
        this.handleSuccessfulLogin(response);
      })
    );
  }

  // Private methods

  private handleSuccessfulLogin(response: LoginResponse): void {
    // Store token (you might want to add rememberMe logic here)
    this.setToken(response.token);
    
    // Decode and store user info from JWT
    const user = this.decodeToken(response.token);
    if (user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      
      // Store user info
      const storage = this.isTokenInLocalStorage() ? localStorage : sessionStorage;
      storage.setItem('current_user', JSON.stringify(user));
    }
  }

  private handleLoginError(error: any): string {
    if (error.status === 401) {
      return 'Email ou mot de passe incorrect.';
    } else if (error.status === 423) {
      return 'Compte verrouillé. Veuillez réessayer plus tard.';
    } else if (error.status === 429) {
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      return 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else {
      return error.error?.message || 'Une erreur est survenue lors de la connexion.';
    }
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload:', payload); // Debug: Log the entire payload
      
      const user = {
        id: payload.id,
        email: payload.email,
        firstName: payload.firstname,
        lastName: payload.lastname,
        role: payload.role
      };
      
      console.log('Decoded user object:', user); // Debug: Log the decoded user
      return user;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }

  private isTokenInLocalStorage(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.decodeToken(token);
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }
} 