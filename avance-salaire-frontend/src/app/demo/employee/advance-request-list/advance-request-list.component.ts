import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus, RequestStatusDisplay } from '../../../core/models/request-status.enum';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-advance-request-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule
  ],
  templateUrl: './advance-request-list.component.html',
  styleUrls: ['./advance-request-list.component.scss']
})
export class AdvanceRequestListComponent implements OnInit {
  requests: SalaryAdvanceRequest[] = [];
  filteredRequests: SalaryAdvanceRequest[] = [];
  statuses = Object.entries(RequestStatus).map(([key, value]) => ({
    value,
    label: RequestStatusDisplay[value as keyof typeof RequestStatusDisplay]
  }));
  selectedStatus: string = '';
  searchTerm: string = '';
  searchSubject = new Subject<string>();
  
  // Pagination
  p: number = 1;
  totalItems: number = 0;

  // Ajout des propriétés pour supporter le template HTML intégré
  demandes = [
    { id: 1, montant: 1223.00, statut: 'approuve', remboursement: 66, date: '2024-07-01', dateFormatted: '01/07/2024' },
    { id: 2, montant: 850.00, statut: 'en-attente', remboursement: 0, date: '2024-07-10', dateFormatted: '10/07/2024' },
    { id: 3, montant: 1500.00, statut: 'rembourse', remboursement: 100, date: '2024-06-15', dateFormatted: '15/06/2024' },
    { id: 4, montant: 2000.00, statut: 'refuse', remboursement: 0, date: '2024-06-20', dateFormatted: '20/06/2024' },
    { id: 5, montant: 750.00, statut: 'approuve', remboursement: 33, date: '2024-05-25', dateFormatted: '25/05/2024' },
    { id: 6, montant: 1200.00, statut: 'en-attente', remboursement: 0, date: '2024-07-12', dateFormatted: '12/07/2024' },
    { id: 7, montant: 900.00, statut: 'approuve', remboursement: 80, date: '2024-04-10', dateFormatted: '10/04/2024' },
    { id: 8, montant: 1800.00, statut: 'rembourse', remboursement: 100, date: '2024-03-15', dateFormatted: '15/03/2024' }
  ];
  statusFilter = '';
  monthFilter = '';
  filteredData = [...this.demandes];
  paginatedData = [];
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  totalPagesArray: number[] = [];
  startItem = 1;
  endItem = 1;
  apiError: string | null = null;

  constructor(private salaryAdvanceService: SalaryAdvanceService, private authService: AuthService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.salaryAdvanceService.getMyRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.apiError = null;
        this.applyFilters();
      },
      error: (err) => {
        if (err.status === 403) {
          this.apiError = "Accès refusé : vous n'avez pas l'autorisation d'afficher vos demandes.";
        } else {
          this.apiError = "Erreur lors de la récupération des demandes (" + (err.status || "") + ")";
        }
        this.requests = [];
        this.applyFilters();
      }
    });
    this.filterData();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onStatusChange(): void {
    this.p = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.requests];
    if (this.selectedStatus) {
      result = result.filter(req => req.status === this.selectedStatus);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        req =>
          req.employeeFullName?.toLowerCase().includes(term) ||
          req.reason?.toLowerCase().includes(term) ||
          req.id.toString().includes(term)
      );
    }
    this.filteredRequests = result;
    this.totalItems = result.length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case RequestStatus.APPROVED:
        return 'bg-success';
      case RequestStatus.REJECTED:
        return 'bg-danger';
      case RequestStatus.PENDING:
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  onSearch() {
    this.filterData();
  }
  onFilter() {
    this.filterData();
  }
  filterData() {
    const search = this.searchTerm.toLowerCase();
    this.filteredData = this.demandes.filter(demande => {
      const matchesSearch = demande.montant.toString().includes(search) ||
        this.formatStatus(demande.statut).toLowerCase().includes(search) ||
        demande.dateFormatted.includes(search);
      const matchesStatus = !this.statusFilter || demande.statut === this.statusFilter;
      const matchesMonth = !this.monthFilter || demande.date.startsWith(this.monthFilter);
      return matchesSearch && matchesStatus && matchesMonth;
    });
    this.currentPage = 1;
    this.updatePagination();
  }
  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filteredData.sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];
      if (column === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    this.updatePagination();
  }
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
    this.paginatedData = this.filteredData.slice(this.startItem - 1, this.endItem);
  }
  changePage(direction: number) {
    const newPage = this.currentPage + direction;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePagination();
    }
  }
  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  formatStatus(statut: string) {
    const statusMap: any = {
      'en-attente': 'En attente',
      'approuve': 'Approuvé',
      'refuse': 'Refusé',
      'rembourse': 'Remboursé'
    };
    return statusMap[statut] || statut;
  }
  viewDemande(id: number) {
    alert(`Afficher la demande #${id}`);
  }
  editDemande(id: number) {
    alert(`Modifier la demande #${id}`);
  }
  deleteDemande(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      const index = this.demandes.findIndex(d => d.id === id);
      if (index > -1) {
        this.demandes.splice(index, 1);
        this.filterData();
      }
    }
  }
  getSortClass(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'asc' : 'desc';
    }
    return '';
  }
}
