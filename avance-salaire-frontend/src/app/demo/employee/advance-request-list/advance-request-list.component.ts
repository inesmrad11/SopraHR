import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus, RequestStatusDisplay } from '../../../core/models/request-status.enum';
import { SalaryAdvanceService } from '../../../core/services/salary-advance.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { BreadcrumbComponent, BreadcrumbItem } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { SearchOutline, CloseOutline, EyeOutline, SortAscendingOutline, LeftOutline, RightOutline, FileTextOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-advance-request-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    NgSelectModule,
    BreadcrumbComponent,
    IconDirective
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
  totalPagesArray: number[] = [];
  startItem = 1;
  endItem = 1;
  apiError: string | null = null;
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', route: '/employee/employee-home' },
    { label: 'Mes demandes', active: true }
  ];

  // Nouvelles propriétés pour le design harmonisé
  showSearch: boolean = false;
  loading: boolean = false;
  itemsPerPageOptions = [5, 10, 15, 25];

  constructor(
    private salaryAdvanceService: SalaryAdvanceService, 
    private authService: AuthService,
    private iconService: IconService,
    private router: Router
  ) {
    this.iconService.addIcon(...[SearchOutline, CloseOutline, EyeOutline, SortAscendingOutline, LeftOutline, RightOutline, FileTextOutline]);
    
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
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
    this.totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
    this.startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
    this.paginatedData = this.filteredData.slice(this.startItem - 1, this.endItem);
  }
  changePage(direction: number) {
    const newPage = this.currentPage + direction;
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
    if (newPage >= 1 && newPage <= totalPages) {
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

  // Nouvelles méthodes pour le design harmonisé
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }

  closeSearch(): void {
    this.showSearch = false;
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleSortOptions(): void {
    // Méthode pour afficher les options de tri si nécessaire
    console.log('Options de tri');
  }

  // Méthodes de pagination harmonisées
  get paginatedRequests(): SalaryAdvanceRequest[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

  get paginationInfo(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredRequests.length);
    return `Affichage de ${startItem} à ${endItem} sur ${this.filteredRequests.length} entrées`;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Méthodes de formatage harmonisées avec request-history
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStatusDisplay(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Validée';
      case 'REJECTED':
        return 'Rejetée';
      default:
        return status;
    }
  }

  getProgressClass(request: any): string {
    const progress = request.repaymentProgress || 0;
    if (progress >= 100) {
      return 'progress-success';
    } else if (progress >= 50) {
      return 'progress-warning';
    } else {
      return 'progress-info';
    }
  }

  viewRequestDetails(request: any): void {
    // Navigation vers la page de détails
    this.router.navigate(['/employee/advance-request-details', request.id]);
  }

  loadRequests(): void {
    this.loading = true;
    this.salaryAdvanceService.getMyRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.filteredRequests = [...requests];
        this.loading = false;
        this.apiError = null;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.apiError = "Accès refusé : vous n'avez pas l'autorisation d'afficher vos demandes.";
        } else {
          this.apiError = "Erreur lors de la récupération des demandes (" + (err.status || "") + ")";
        }
        this.requests = [];
        this.filteredRequests = [];
      }
    });
  }
}
