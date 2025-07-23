import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.authService.getAuthHeaders() });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.authService.getAuthHeaders() });
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { headers: this.authService.getAuthHeaders() });
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers: this.authService.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authService.getAuthHeaders() });
  }
} 