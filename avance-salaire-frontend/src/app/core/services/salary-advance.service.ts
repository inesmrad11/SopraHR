import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { SalaryAdvanceRequest } from '../models/salary-advance-request.model';
import { environment } from '../../../environments/environment';
import { RequestHistory } from '../models/request-history.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryAdvanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/advance-requests`;
  private readonly authService = inject(AuthService);

  private getHeaders() {
    return this.authService.getAuthHeaders();
  }

  createRequest(request: Partial<SalaryAdvanceRequest>): Observable<SalaryAdvanceRequest> {
    const headers = this.getHeaders();
    const body = JSON.stringify(request);
    
    console.log('Sending request to:', this.apiUrl);
    console.log('Request body:', body);
    
    return this.http.post<SalaryAdvanceRequest>(
      this.apiUrl,
      body,
      { 
        headers,
        withCredentials: true
      }
    ).pipe(
      map(response => {
        console.log('API Response:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  getMyRequests(): Observable<SalaryAdvanceRequest[]> {
    return this.http.get<SalaryAdvanceRequest[]>(
      `${this.apiUrl}/me`,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getRequestById(id: number): Observable<SalaryAdvanceRequest> {
    return this.http.get<SalaryAdvanceRequest>(
      `${this.apiUrl}/${id}`,
      { 
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  cancelRequest(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      { 
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère l'historique des statuts pour une demande d'avance
   */
  getRequestHistoryById(id: number): Observable<RequestHistory[]> {
    return this.http.get<RequestHistory[]>(
      `${this.apiUrl}/${id}/history`,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère toutes les demandes d'avance (pour RH)
   */
  getAllRequests(): Observable<SalaryAdvanceRequest[]> {
    return this.http.get<SalaryAdvanceRequest[]>(
      this.apiUrl,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Approuve une demande d'avance
   */
  approveRequest(id: number, comment: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/approve`,
      { comment },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Rejette une demande d'avance
   */
  rejectRequest(id: number, comment: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/reject`,
      { comment },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Télécharge l'analytics RH au format Excel
   */
  downloadAnalyticsExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/analytics/export/excel`, {
      headers: this.getHeaders(),
      withCredentials: true,
      responseType: 'blob'
    });
  }

  /**
   * Télécharge l'analytics RH au format PDF
   */
  downloadAnalyticsPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/analytics/export/pdf`, {
      headers: this.getHeaders(),
      withCredentials: true,
      responseType: 'blob'
    });
  }

  /**
   * Récupère l'historique des demandes traitées (validées/rejetées) avec filtres
   */
  getRequestHistory(filters: { status?: string; employee?: string; from?: string; to?: string }): Observable<SalaryAdvanceRequest[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.employee) params = params.set('employee', filters.employee);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<SalaryAdvanceRequest[]>(`${this.apiUrl}/historique`, {
      headers: this.getHeaders(),
      withCredentials: true,
      params
    }).pipe(catchError(this.handleError));
  }

  /**
   * Exporte l'historique filtré en Excel
   */
  exportRequestHistoryExcel(filters: { status?: string; employee?: string; from?: string; to?: string }): Observable<Blob> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.employee) params = params.set('employee', filters.employee);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get(`${this.apiUrl}/historique/export/excel`, {
      headers: this.getHeaders(),
      withCredentials: true,
      params,
      responseType: 'blob'
    });
  }

  /**
   * Exporte l'historique filtré en PDF
   */
  exportRequestHistoryPdf(filters: { status?: string; employee?: string; from?: string; to?: string }): Observable<Blob> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.employee) params = params.set('employee', filters.employee);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get(`${this.apiUrl}/historique/export/pdf`, {
      headers: this.getHeaders(),
      withCredentials: true,
      params,
      responseType: 'blob'
    });
  }

  /**
   * Change le statut d'une demande (Kanban)
   */
  changeRequestStatus(id: number, newStatus: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/changer-statut`,
      { status: newStatus },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Récupère les statistiques globales pour le dashboard RH
   */
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.group('API Error');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Error details:', error.error);
    console.groupEnd();

    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = error.error?.message || 'Invalid request. Please check your input.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
