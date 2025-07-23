import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { DecimalPipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, NgxPaginationModule],
  templateUrl: './request-history.html',
  styleUrl: './request-history.scss'
})
export class RequestHistory implements OnInit {
  requests: SalaryAdvanceRequest[] = [];
  filteredRequests: SalaryAdvanceRequest[] = [];
  loading = false;
  error = '';
  filterStatus = '';
  filterEmployee = '';
  filterFrom = '';
  filterTo = '';
  statusList = ['PENDING', 'APPROVED', 'REJECTED'];
  p = 1;
  pageSize = 10;
  totalItems = 0;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedRequest: SalaryAdvanceRequest | null = null;
  requestStatusHistory: any[] = [];

  constructor(private salaryAdvanceService: SalaryAdvanceService) {}

  ngOnInit() {
    this.fetchHistory();
  }

  applyFilters() {
    // For now, just copy all requests (add filter logic here if needed)
    this.filteredRequests = [...this.requests];
    this.totalItems = this.filteredRequests.length;
  }

  fetchHistory() {
    this.p = 1; // Reset to first page only when fetching new data
    this.loading = true;
    this.salaryAdvanceService.getRequestHistory({
      status: this.filterStatus,
      employee: this.filterEmployee,
      from: this.filterFrom,
      to: this.filterTo
    }).subscribe({
      next: (data: any) => {
        this.requests = data.items || data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement de l\'historique.';
        this.loading = false;
      }
    });
  }

  onExportExcel() {
    this.salaryAdvanceService.exportRequestHistoryExcel({
      status: this.filterStatus,
      employee: this.filterEmployee,
      from: this.filterFrom,
      to: this.filterTo
    }).subscribe(blob => {
      this.saveFile(blob, 'historique.xlsx');
    });
  }
  onExportPdf() {
    this.salaryAdvanceService.exportRequestHistoryPdf({
      status: this.filterStatus,
      employee: this.filterEmployee,
      from: this.filterFrom,
      to: this.filterTo
    }).subscribe(blob => {
      this.saveFile(blob, 'historique.pdf');
    });
  }
  // Remove onPageChange, let ngx-pagination handle page changes
  private saveFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.requests.sort((a: any, b: any) => {
      let aValue = a[column];
      let bValue = b[column];
      if (column === 'requestDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    this.applyFilters();
  }
  getSortClass(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'asc' : 'desc';
    }
    return '';
  }
  openDetails(req: SalaryAdvanceRequest) {
    this.selectedRequest = req;
    this.requestStatusHistory = [];
    this.salaryAdvanceService.getRequestHistoryById(req.id).subscribe({
      next: (history) => {
        this.requestStatusHistory = history;
      },
      error: (err) => {
        this.requestStatusHistory = [];
      }
    });
  }
  closeDetailsModal() {
    this.selectedRequest = null;
  }
}
