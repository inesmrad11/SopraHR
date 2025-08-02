import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { 
  SearchOutline, 
  FileExcelOutline, 
  FilePdfOutline, 
  EyeOutline,
  LeftOutline,
  RightOutline,
  CalendarOutline,
  DownOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  CloseOutline
} from '@ant-design/icons-angular/icons';
import { SalaryAdvanceRequest } from '../../../core/models/salary-advance-request.model';
import { RequestStatus, RequestStatusDisplay } from '../../../core/models/request-status.enum';
import { AdvanceRequestService } from '../../../core/services/advance-request.service';
import { RoleTranslatePipe } from '../../../core/pipes/role-translate.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [CommonModule, FormsModule, IconDirective, RoleTranslatePipe],
  templateUrl: './request-history.html',
  styleUrls: ['./request-history.scss']
})
export class RequestHistoryComponent implements OnInit {
  requests: SalaryAdvanceRequest[] = [];
  filteredRequests: SalaryAdvanceRequest[] = [];
  selectedRequest: SalaryAdvanceRequest | null = null;
  showModal = false;
  
  // Filter properties
  searchTerm = '';
  selectedStatus = '';
  selectedDate = '';
  filterFrom = '';
  filterTo = '';
  showFilters = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions = [5, 10, 15, 25];
  
  // Loading state
  isLoading = false;
  
  // Status options for filter
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: RequestStatus.PENDING, label: RequestStatusDisplay[RequestStatus.PENDING] },
    { value: RequestStatus.APPROVED, label: RequestStatusDisplay[RequestStatus.APPROVED] },
    { value: RequestStatus.REJECTED, label: RequestStatusDisplay[RequestStatus.REJECTED] }
  ];

  private iconService = inject(IconService);
  private advanceRequestService = inject(AdvanceRequestService);

  constructor() {
    // Add Ant Design icons
    this.iconService.addIcon(...[
      SearchOutline, 
      FileExcelOutline, 
      FilePdfOutline, 
      EyeOutline,
      LeftOutline,
      RightOutline,
      CalendarOutline,
      DownOutline,
      CheckCircleOutline,
      ClockCircleOutline,
      CloseOutline
    ]);
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.advanceRequestService.getAllRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
        // Show error message to user
        this.requests = [];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.requests];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.employeeFullName?.toLowerCase().includes(search) ||
        request.reason.toLowerCase().includes(search) ||
        request.id.toString().includes(search)
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(request => request.status === this.selectedStatus);
    }

    // Apply date filter
    if (this.selectedDate) {
      const selectedDate = new Date(this.selectedDate);
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.requestDate);
        return requestDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Apply date range filters
    if (this.filterFrom) {
      const from = new Date(this.filterFrom);
      filtered = filtered.filter(request => new Date(request.requestDate) >= from);
    }

    if (this.filterTo) {
      const to = new Date(this.filterTo);
      filtered = filtered.filter(request => new Date(request.requestDate) <= to);
    }

    this.filteredRequests = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset to first page when filters change
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.applyFilters();
  }

  getStatusDisplay(status: RequestStatus): string {
    return RequestStatusDisplay[status] || status;
  }

  getStatusClass(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.PENDING:
        return 'status-pending';
      case RequestStatus.APPROVED:
        return 'status-approved';
      case RequestStatus.REJECTED:
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  getEmployeeInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getEmployeeAvatar(request: SalaryAdvanceRequest): string {
    // Return profile picture if available, otherwise return empty string for initials
    return request.employeeProfilePicture || '';
  }

  hasProfilePicture(request: SalaryAdvanceRequest): boolean {
    return !!request.employeeProfilePicture;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'block';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' TND';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  openModal(request: SalaryAdvanceRequest): void {
    this.selectedRequest = request;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequest = null;
  }

  exportToExcel(): void {
    try {
      // Create workbook and worksheet
      const data = this.filteredRequests.map(request => ({
        'Employé': request.employeeFullName || 'N/A',
        'Montant': this.formatAmount(request.requestedAmount),
        'Statut': this.getStatusDisplay(request.status),
        'Date': this.formatDate(request.requestDate),
        'Raison': request.reason || 'N/A',
        'Durée (mois)': request.repaymentMonths || 0,
        'Salaire Net': request.employeeSalaryNet ? this.formatAmount(request.employeeSalaryNet) : 'N/A',
        'Plafond Disponible': request.plafondDisponible ? this.formatAmount(request.plafondDisponible) : 'N/A'
      }));

      // Convert to CSV with BOM for Excel compatibility
      const headers = Object.keys(data[0]);
      const csvContent = '\ufeff' + [
        headers.join(';'), // Use semicolon for better Excel compatibility
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(';'))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historique_demandes_avance_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Export Excel/CSV successful');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Erreur lors de l\'export Excel');
    }
  }

  exportToPDF(): void {
    try {
      // Create PDF content using jsPDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Historique des demandes d\'avance', 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
      
      // Add table headers
      const headers = ['Employé', 'Montant', 'Statut', 'Date'];
      const data = this.filteredRequests.map(request => [
        request.employeeFullName || 'N/A',
        this.formatAmount(request.requestedAmount),
        this.getStatusDisplay(request.status),
        this.formatDate(request.requestDate)
      ]);
      
      // Create table
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [80, 0, 128], // Sopra purple
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
      
      // Save the PDF
      const fileName = `historique_demandes_avance_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log('Export PDF successful');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      // Fallback to HTML if jsPDF is not available
      this.exportToHTML();
    }
  }

  private exportToHTML(): void {
    try {
      // Create HTML content as fallback
      const data = this.filteredRequests.map(request => [
        request.employeeFullName,
        this.formatAmount(request.requestedAmount),
        this.getStatusDisplay(request.status),
        this.formatDate(request.requestDate)
      ]);

      const tableRows = data.map(row => 
        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
      ).join('');

      const htmlContent = `
        <html>
          <head>
            <title>Historique des demandes d'avance</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #500080; color: white; font-weight: bold; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Historique des demandes d'avance</h1>
            <p>Généré le: ${new Date().toLocaleDateString('fr-FR')}</p>
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historique_demandes_avance_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Export HTML fallback successful');
    } catch (error) {
      console.error('Error exporting to HTML:', error);
      alert('Erreur lors de l\'export PDF/HTML');
    }
  }

  // Pagination methods
  get paginatedRequests(): SalaryAdvanceRequest[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing items per page
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

  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} sur ${this.totalItems}`;
  }
}
