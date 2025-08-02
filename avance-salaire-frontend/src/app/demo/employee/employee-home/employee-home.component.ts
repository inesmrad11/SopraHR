// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';

// project import
import tableData from 'src/fake-data/default-data.json';

import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from 'src/app/theme/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from 'src/app/theme/shared/apexchart/sales-report-chart/sales-report-chart.component';
import { SalaryAdvanceService } from 'src/app/core/services/salary-advance.service';
import { NgApexchartsModule } from 'ng-apexcharts';

// icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-employee-home',
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    IconDirective,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent,
    AnalyticsChartComponent,
    SalesReportChartComponent,
    NgApexchartsModule,
    BreadcrumbComponent
  ],
  templateUrl: './employee-home.html',
  styleUrls: ['./employee-home.scss']
})
export class EmployeeHomeComponent implements OnInit {
  private iconService = inject(IconService);
  private salaryAdvanceService = inject(SalaryAdvanceService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  today: Date = new Date();
  userFirstName: string = 'Prénom';
  userLastName: string = 'Nom';
  userFullName: string = 'Utilisateur';
  welcomeImage: string = '';

  cardImages = [
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/8d0f3c19-2547-4b20-8911-9713329c4ca6_800w.jpg',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/9dead2ce-9640-41bd-8153-af6e7acc42cf_800w.jpg',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/86c20217-e734-45e2-a50b-0e5602db415c_800w.jpg'
  ];

  // constructor
  constructor() {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }

  recentOrder: any[] = [];

  AnalyticEcommerce: any[] = [];

  transaction: any[] = [];
  user: User | null = null;
  myRequests: any[] = [];
  monthlyChartSeries: any[] = [];
  monthlyChartCategories: string[] = [];
  incomeChartSeries: any[] = [];
  incomeChartCategories: string[] = [];
  dashboardStats: any = {};
  statusPieChart: any[] = [];
  globalRepaymentProgress: number = 0;
  donutChartOptions: any;
  donutChartSeries: number[] = [];
  pieChartOptions: any;
  pieChartSeries: number[] = [];
  cumulativeChartOptions: any;
  cumulativeChartSeries: any[] = [];
  salaryRepaymentChartOptions: any;
  salaryRepaymentChartSeries: any[] = [];
  reasonPieChartOptions: any;
  reasonPieChartSeries: number[] = [];
  reasonPieChartLabels: string[] = [];
  ganttData: any[] = [];
  predictedZeroDate: Date | null = null;
  financialHealthScore: number = 0;
  financialHealthLabel: string = '';
  financialHealthColor: string = '';

  // Propriétés pour le calendrier
  currentDate: Date = new Date();
  calendarDays: any[] = [];
  calendarMonth: string = '';
  calendarYear: number = 2024;

  // Propriétés pour les fonctionnalités des boutons
  showSearch: boolean = false;
  showNotifications: boolean = false;
  showAnalysis: boolean = false;
  showFilters: boolean = false;

  showSuccessMessage: boolean = false;
  successMessage: string = '';
  isErrorMessage: boolean = false;
  
  searchQuery: string = '';
  searchResults: any[] = [];
  searchFilters: any = {
    status: '',
    minAmount: null,
    maxAmount: null
  };
  
  notifications: any[] = [];
  unreadNotifications: number = 0;
  
  smartFilters: any = {
    status: '',
    period: '',
    minAmount: null,
    maxAmount: null,
    progress: '',
    reason: ''
  };
  
  // Données filtrées pour le tableau
  filteredRequests: any[] = [];
  
  selectedRequest: any = null;
  
  // Propriétés pour l'analyse des graphiques
  totalRequests: number = 0;
  averageMonthlyRequests: number = 0;
  trendPercentage: number = 0;
  trendDirection: string = '';
  chartInsights: any[] = [];

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    
    // Charger les notifications au démarrage
    this.loadNotifications();
    
    // Mettre à jour les noms avec les vraies données de l'utilisateur
    if (this.user) {
      this.userFirstName = this.user.firstName || 'Prénom';
      this.userLastName = this.user.lastName || 'Nom';
      // Utiliser le nom complet s'il existe, sinon construire à partir du prénom et nom
      this.userFullName = this.user.name && this.user.name.trim() !== '' 
        ? this.user.name 
        : `${this.userFirstName} ${this.userLastName}`.trim();
      
      console.log('Utilisateur connecté:', {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        name: this.user.name,
        userFullName: this.userFullName
      });
    }
    
    this.salaryAdvanceService.getMyRequests().subscribe((requests) => {
      this.myRequests = requests || [];
      this.filteredRequests = [...this.myRequests]; // Initialiser les données filtrées
      // Filtrer uniquement les avances APPROVED non totalement remboursées
      const activeApproved = this.myRequests.filter(req => req.status === 'APPROVED' && (req.totalAvancesNonRemboursees || 0) > 0);
      const months = Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));

      // Calculs cumulés
      const salary = this.myRequests[0]?.employeeSalaryNet || 0;
      const plafond = salary * 2;
      // cumul des avances non remboursées (seulement APPROVED non remboursées)
      const totalNonRembourse = activeApproved.reduce((sum, req) => sum + (req.totalAvancesNonRemboursees || 0), 0);
      const plafondDisponible = plafond - totalNonRembourse;
      const nbAvancesPossibles = salary > 0 ? Math.floor(plafondDisponible / salary) : 0;

      this.dashboardStats = {
        salary,
        plafond,
        totalNonRembourse,
        plafondDisponible,
        nbAvancesPossibles
      };

      // Statut distribution pour Pie chart (toutes les demandes)
      const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
      this.myRequests.forEach(req => {
        if (statusCounts[req.status] !== undefined) statusCounts[req.status]++;
      });
      this.statusPieChart = [
        { name: 'En attente', y: statusCounts.PENDING },
        { name: 'Validées', y: statusCounts.APPROVED },
        { name: 'Rejetées', y: statusCounts.REJECTED }
      ];

      // Progression globale de remboursement (moyenne sur les avances APPROVED non remboursées)
      const activeProgress = activeApproved.map(req => req.repaymentProgress || 0);
      this.globalRepaymentProgress = activeProgress.length ? Math.round(activeProgress.reduce((a, b) => a + b, 0) / activeProgress.length) : 0;

      // Prepare recentOrder (last 5 demandes actives)
      this.recentOrder = activeApproved.slice(-5).reverse().map(req => ({
        id: req.id,
        name: req.reason || 'Avance',
        status: req.status,
        status_type: req.status === 'APPROVED' ? 'bg-success' : req.status === 'REJECTED' ? 'bg-danger' : 'bg-warning',
        quantity: req.repaymentMonths,
        amount: req.requestedAmount + ' TND'
      }));
      // Prepare transaction history (status changes, repayments, etc. sur avances actives)
      this.transaction = activeApproved.map(req => ({
        background: req.status === 'APPROVED' ? 'text-success bg-light-success' : req.status === 'REJECTED' ? 'text-danger bg-light-danger' : 'text-warning bg-light-warning',
        icon: req.status === 'APPROVED' ? 'gift' : req.status === 'REJECTED' ? 'setting' : 'message',
        title: 'Demande #' + req.id,
        time: req.requestDate ? (new Date(req.requestDate)).toLocaleDateString() : '',
        amount: (req.status === 'APPROVED' ? '+ ' : req.status === 'REJECTED' ? '- ' : '') + req.requestedAmount + ' TND',
        percentage: req.repaymentProgress ? req.repaymentProgress + '%' : ''
      })).slice(-5).reverse();
      // Prepare monthly chart data (nombre de demandes actives par mois)
      const requestsByMonth = Array(12).fill(0);
      activeApproved.forEach(req => {
        const month = new Date(req.requestDate).getMonth();
        requestsByMonth[month]++;
      });
      this.monthlyChartSeries = [{ name: 'Mes avances actives', data: requestsByMonth }];
      this.monthlyChartCategories = months;
      // Prepare income chart data (total demandé sur avances actives par mois)
      const amountByMonth = Array(12).fill(0);
      activeApproved.forEach(req => {
        const month = new Date(req.requestDate).getMonth();
        amountByMonth[month] += req.requestedAmount;
      });
      this.incomeChartSeries = [{ data: amountByMonth }];
      this.incomeChartCategories = months;

      // Donut chart (marge utilisée vs restante)
      const used = this.dashboardStats.totalNonRembourse || 0;
      const available = this.dashboardStats.plafondDisponible || 0;
      this.donutChartSeries = [used, available > 0 ? available : 0];
      this.donutChartOptions = {
        chart: {
          type: 'donut',
          height: 220
        },
        labels: ['Marge utilisée', 'Marge restante'],
        colors: ['#faad14', '#52c41a'],
        legend: {
          show: true,
          position: 'bottom'
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return val.toFixed(0) + '%';
          }
        },
        tooltip: {
          y: {
            formatter: function (val: number) {
              return val + ' TND';
            }
          }
        }
      };

      // Pie chart (répartition des statuts)
      this.pieChartSeries = [
        this.statusPieChart[0]?.y || 0,
        this.statusPieChart[1]?.y || 0,
        this.statusPieChart[2]?.y || 0
      ];
      this.pieChartOptions = {
        chart: {
          type: 'pie',
          height: 220
        },
        labels: ['En attente', 'Validées', 'Rejetées'],
        colors: ['#faad14', '#52c41a', '#ff4d4f'],
        legend: {
          show: true,
          position: 'bottom'
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return val.toFixed(0) + '%';
          }
        },
        tooltip: {
          y: {
            formatter: function (val: number) {
              return val + ' demandes';
            }
          }
        }
      };

      // Courbe cumul avances non remboursées par mois (seulement avances APPROVED non remboursées)
      const cumulByMonth = Array(12).fill(0);
      for (let m = 0; m < 12; m++) {
        cumulByMonth[m] = activeApproved.reduce((sum, req) => {
          const reqDate = new Date(req.requestDate);
          if (reqDate.getMonth() <= m && (req.totalAvancesNonRemboursees || 0) > 0) {
            return sum + (req.totalAvancesNonRemboursees || 0);
          }
          return sum;
        }, 0);
      }
      this.cumulativeChartSeries = [{
        name: 'Cumul non remboursé',
        data: cumulByMonth
      }];
      this.cumulativeChartOptions = {
        chart: {
          type: 'area',
          height: 250,
          toolbar: { show: false },
          background: 'transparent'
        },
        colors: ['#1677ff'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
          categories: months,
          labels: { style: { colors: Array(12).fill('#8c8c8c') } }
        },
        yaxis: {
          labels: { style: { colors: ['#8c8c8c'] } }
        },
        grid: { borderColor: '#f5f5f5' },
        tooltip: { theme: 'light' }
      };

      // Bar chart du % salaire remboursé chaque mois (seulement avances APPROVED non remboursées)
      const repaymentByMonth = Array(12).fill(0);
      activeApproved.forEach(req => {
        if (req.repaymentMonths && req.requestDate && req.requestedAmount) {
          const startMonth = new Date(req.requestDate).getMonth() + 1;
          const monthlyAmount = req.requestedAmount / req.repaymentMonths;
          for (let i = 0; i < req.repaymentMonths; i++) {
            const m = (startMonth + i) % 12;
            repaymentByMonth[m] += monthlyAmount;
          }
        }
      });
      const percentByMonth = salary > 0 ? repaymentByMonth.map(val => Math.round((val / salary) * 100)) : Array(12).fill(0);
      this.salaryRepaymentChartSeries = [{
        name: '% Salaire remboursé',
        data: percentByMonth
      }];
      this.salaryRepaymentChartOptions = {
        chart: {
          type: 'bar',
          height: 250,
          toolbar: { show: false },
          background: 'transparent'
        },
        colors: ['#faad14'],
        dataLabels: { enabled: true },
        xaxis: {
          categories: months,
          labels: { style: { colors: Array(12).fill('#8c8c8c') } }
        },
        yaxis: {
          labels: { style: { colors: ['#8c8c8c'] }, formatter: (val: number) => val + '%' },
          min: 0,
          max: 100
        },
        grid: { borderColor: '#f5f5f5' },
        tooltip: { theme: 'light', y: { formatter: (val: number) => val + ' % du salaire' } }
      };

      // --- PIE CHART: Répartition des motifs de demande d'avance ---
      const reasonCounts: { [key: string]: number } = {};
      this.myRequests.forEach(req => {
        if (req.reason) {
          reasonCounts[req.reason] = (reasonCounts[req.reason] || 0) + 1;
        }
      });
      this.reasonPieChartLabels = Object.keys(reasonCounts);
      this.reasonPieChartSeries = Object.values(reasonCounts);
      this.reasonPieChartOptions = {
        chart: { type: 'pie', height: 220 },
        labels: this.reasonPieChartLabels,
        colors: ['#1677ff', '#faad14', '#52c41a', '#ff4d4f', '#13c2c2', '#b37feb', '#fa541c'],
        legend: { show: true, position: 'bottom' },
        dataLabels: { enabled: true },
        tooltip: { y: { formatter: (val: number) => val + ' demandes' } }
      };

      // --- GANTT: Timeline de remboursement pour chaque avance en cours ---
      this.ganttData = activeApproved.map(req => {
        const start = new Date(req.requestDate);
        const months = req.repaymentMonths || 1;
        const schedule = [];
        for (let i = 0; i < months; i++) {
          const due = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
          schedule.push({
            dueDate: due,
            paid: req.repaymentSchedules ? req.repaymentSchedules[i]?.paid : false,
            amount: req.repaymentSchedules ? req.repaymentSchedules[i]?.amount : null
          });
        }
        return {
          id: req.id,
          reason: req.reason,
          schedule
        };
      });

      // --- Predicted Zero Date: date de retour à zéro ---
      let lastRepayment: Date | null = null;
      activeApproved.forEach(req => {
        if (req.repaymentSchedules && req.repaymentSchedules.length) {
          const last = req.repaymentSchedules[req.repaymentSchedules.length - 1];
          const d = new Date(last.dueDate);
          if (!lastRepayment || d > lastRepayment) lastRepayment = d;
        }
      });
      this.predictedZeroDate = lastRepayment;

      // --- Financial Health Score ---
      // Simple: 100 - % plafond utilisé - % avances en retard
      const plafondUsed = plafond > 0 ? (totalNonRembourse / plafond) * 100 : 0;
      let lateCount = 0, totalSchedules = 0;
      activeApproved.forEach(req => {
        if (req.repaymentSchedules) {
          req.repaymentSchedules.forEach(sch => {
            totalSchedules++;
            if (!sch.paid && new Date(sch.dueDate) < new Date()) lateCount++;
          });
        }
      });
      const lateRate = totalSchedules > 0 ? (lateCount / totalSchedules) * 100 : 0;
      this.financialHealthScore = Math.max(0, Math.round(100 - plafondUsed - lateRate));
      if (this.financialHealthScore >= 80) {
        this.financialHealthLabel = 'Excellent';
        this.financialHealthColor = 'success';
      } else if (this.financialHealthScore >= 60) {
        this.financialHealthLabel = 'Bon';
        this.financialHealthColor = 'primary';
      } else if (this.financialHealthScore >= 40) {
        this.financialHealthLabel = 'Moyen';
        this.financialHealthColor = 'warning';
      } else {
        this.financialHealthLabel = 'À surveiller';
        this.financialHealthColor = 'danger';
      }
    });
    this.salaryAdvanceService.getAnalytics().subscribe((data) => {
      this.AnalyticEcommerce = [
        {
          title: 'En attente',
          amount: data.pendingRequests,
          background: 'bg-light-warning',
          border: 'border-warning',
          icon: 'rise',
          percentage: data.pendingRate ? data.pendingRate + '%' : '',
          color: 'text-warning',
          number: data.pendingExtra || ''
        },
        {
          title: 'Validées',
          amount: data.approvedRequests,
          background: 'bg-light-success',
          border: 'border-success',
          icon: 'rise',
          percentage: data.approvedRate ? data.approvedRate + '%' : '',
          color: 'text-success',
          number: data.approvedExtra || ''
        },
        {
          title: 'Rejetées',
          amount: data.rejectedRequests,
          background: 'bg-light-danger',
          border: 'border-danger',
          icon: 'fall',
          percentage: data.rejectedRate ? data.rejectedRate + '%' : '',
          color: 'text-danger',
          number: data.rejectedExtra || ''
        },
        {
          title: 'Montant total demandé',
          amount: data.totalRequestedAmount + ' TND',
          background: 'bg-light-primary',
          border: 'border-primary',
          icon: 'rise',
          percentage: data.amountRate ? data.amountRate + '%' : '',
          color: 'text-primary',
          number: data.amountExtra ? data.amountExtra + ' TND' : ''
        }
      ];
    });

    // Set image based on day of week (1 = Monday, 7 = Sunday)
    const day = this.today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const imageMap = [
      '7.jpg', // Sunday (0)
      '2.jpg', // Monday (1)
      '2.jpg', // Tuesday (2)
      '3.jpg', // Wednesday (3)
      '4.jpg', // Thursday (4)
      '5.jpg', // Friday (5)
      '6.jpg', // Saturday (6)
    ];
    this.welcomeImage = 'assets/images/welcome/' + imageMap[day];

    // Initialiser le calendrier
    this.generateCalendar();
  }

  get frenchDate(): string {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const d = this.today;
    return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
  }

  // Méthodes pour le nouveau design
  getProgressPercentage(request: any): number {
    if (!request || !request.requestedAmount) return 0;
    
    const repaidAmount = request.repaidAmount || 0;
    const percentage = (repaidAmount / request.requestedAmount) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  getMarginPercentage(): number {
    if (!this.dashboardStats || !this.dashboardStats.plafond) return 0;
    
    const used = this.dashboardStats.plafond - this.dashboardStats.plafondDisponible;
    const percentage = (used / this.dashboardStats.plafond) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  viewRequestDetails(request: any): void {
    // Navigation vers les détails de la demande
    this.router.navigate(['/employee/advance-request-details', request.id]);
  }

  // Méthodes pour le calendrier
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.calendarYear = year;
    this.calendarMonth = this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Commencer par lundi
    
    this.calendarDays = [];
    
    for (let i = 0; i < 42; i++) { // 6 semaines * 7 jours
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const hasEvent = this.hasEventOnDate(currentDate);
      
      this.calendarDays.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        hasEvent
      });
    }
  }

  hasEventOnDate(date: Date): boolean {
    // Logique pour vérifier s'il y a des événements à cette date
    // Pour l'instant, on simule des événements les 20 et 21 juillet
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    return (day === 20 && month === 6 && year === 2024) || 
           (day === 21 && month === 6 && year === 2024);
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  // Méthodes pour la recherche
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  closeSearch(): void {
    this.showSearch = false;
  }

  onSearchInput(): void {
    this.performSearch();
  }

  performSearch(): void {
    if (!this.searchQuery.trim() && !this.searchFilters.status && !this.searchFilters.minAmount && !this.searchFilters.maxAmount) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.myRequests.filter(req => {
      let matches = true;
      
      // Recherche par texte
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        matches = matches && (
          req.id.toString().includes(query) ||
          (req.reason && req.reason.toLowerCase().includes(query)) ||
          req.status.toLowerCase().includes(query)
        );
      }
      
      // Filtre par statut
      if (this.searchFilters.status) {
        matches = matches && req.status === this.searchFilters.status;
      }
      
      // Filtre par montant minimum
      if (this.searchFilters.minAmount) {
        matches = matches && req.requestedAmount >= this.searchFilters.minAmount;
      }
      
      // Filtre par montant maximum
      if (this.searchFilters.maxAmount) {
        matches = matches && req.requestedAmount <= this.searchFilters.maxAmount;
      }
      
      return matches;
    });
  }

  applyFilters(): void {
    this.performSearch();
  }

  // Méthodes pour les notifications
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  loadNotifications(): void {
    // Utiliser le service de notifications
    this.notificationService.notifications.subscribe(notifications => {
      this.notifications = notifications;
      this.unreadNotifications = notifications.filter(n => !n.read).length;
    });
    
    // Charger les notifications depuis le service
    this.notificationService.loadNotifications();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'POSITIVE_FEEDBACK':
      case 'CONGRATS_NO_LATE_REPAYMENT':
        return 'check-circle';
      case 'ACTION_REMINDER':
      case 'WORKLOAD_ALERT':
      case 'UNUSUAL_REQUEST':
      case 'PREVENTIVE_ALERT':
      case 'PROGRESSIVE_REMINDER_24H':
      case 'PROGRESSIVE_REMINDER_3D':
      case 'PROGRESSIVE_REMINDER_5D':
      case 'INACTIVITY_REMINDER':
        return 'exclamation-circle';
      case 'ERROR':
        return 'close-circle';
      case 'FINANCIAL_ADVICE':
      case 'SUGGESTION':
      case 'PROFILE_SUGGESTION':
      case 'STATISTICS_ALERT':
      case 'COLLECTIVE_STATS':
      case 'PATTERN_DETECTION':
      case 'ANTICIPATION_ALERT':
      case 'UPCOMING_INSTALLMENT':
      case 'POLICY_UPDATE':
      case 'RULE_CHANGE':
      case 'TEAM_PERFORMANCE':
      case 'ACTIVITY_PEAK':
      case 'CALENDAR_REMINDER':
      case 'MAINTENANCE':
      case 'APP_UPDATE':
        return 'info-circle';
      default:
        return 'bell';
    }
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId);
  }

  // Méthodes pour l'export
  exportData(): void {
    const data = {
      user: this.user,
      requests: this.myRequests,
      stats: this.dashboardStats,
      date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avances-salaire-${this.user?.firstName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Méthodes pour l'analyse des graphiques
  showChartAnalysis(): void {
    this.calculateChartAnalysis();
    this.showAnalysis = true;
  }

  closeAnalysis(): void {
    this.showAnalysis = false;
  }

  calculateChartAnalysis(): void {
    this.totalRequests = this.myRequests.length;
    this.averageMonthlyRequests = this.totalRequests > 0 ? Math.round(this.totalRequests / 12) : 0;
    
    // Calculer la tendance
    const recentRequests = this.myRequests.filter(req => {
      const reqDate = new Date(req.requestDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return reqDate >= threeMonthsAgo;
    });
    
    const olderRequests = this.myRequests.filter(req => {
      const reqDate = new Date(req.requestDate);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return reqDate >= sixMonthsAgo && reqDate < threeMonthsAgo;
    });
    
    if (olderRequests.length > 0) {
      this.trendPercentage = Math.round(((recentRequests.length - olderRequests.length) / olderRequests.length) * 100);
    } else {
      this.trendPercentage = recentRequests.length > 0 ? 100 : 0;
    }
    
    this.trendDirection = this.trendPercentage > 0 ? 'positive' : this.trendPercentage < 0 ? 'negative' : 'neutral';
    
    // Générer les insights
    this.chartInsights = [];
    if (this.totalRequests > 0) {
      this.chartInsights.push({
        icon: 'rise',
        message: `Vous avez fait ${this.totalRequests} demandes d'avance au total`
      });
      
      if (this.trendPercentage > 0) {
        this.chartInsights.push({
          icon: 'arrow-up',
          message: `Augmentation de ${Math.abs(this.trendPercentage)}% par rapport aux 3 derniers mois`
        });
      } else if (this.trendPercentage < 0) {
        this.chartInsights.push({
          icon: 'arrow-down',
          message: `Diminution de ${Math.abs(this.trendPercentage)}% par rapport aux 3 derniers mois`
        });
      }
      
      const approvedRequests = this.myRequests.filter(req => req.status === 'APPROVED').length;
      const approvalRate = Math.round((approvedRequests / this.totalRequests) * 100);
      this.chartInsights.push({
        icon: 'check-circle',
        message: `Taux d'approbation de ${approvalRate}%`
      });
    }
  }

  exportChartData(): void {
    const chartData = {
      monthlyData: this.monthlyChartSeries,
      categories: this.monthlyChartCategories,
      analysis: {
        totalRequests: this.totalRequests,
        averageMonthlyRequests: this.averageMonthlyRequests,
        trendPercentage: this.trendPercentage,
        insights: this.chartInsights
      }
    };
    
    const blob = new Blob([JSON.stringify(chartData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-graphique-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateReport(): void {
    // Créer un rapport détaillé
    const reportData = {
      title: 'Rapport d\'analyse des avances de salaire',
      date: new Date().toLocaleDateString('fr-FR'),
      user: this.user,
      summary: {
        totalRequests: this.totalRequests,
        averageMonthlyRequests: this.averageMonthlyRequests,
        trendPercentage: this.trendPercentage,
        trendDirection: this.trendDirection,
        approvalRate: this.myRequests.length > 0 ? 
          Math.round((this.myRequests.filter(req => req.status === 'APPROVED').length / this.myRequests.length) * 100) : 0
      },
      insights: this.chartInsights,
      monthlyData: this.monthlyChartSeries,
      categories: this.monthlyChartCategories,
      requests: this.myRequests.slice(0, 10) // Les 10 dernières demandes
    };
    
    // Créer le contenu HTML du rapport
    const reportHTML = this.generateReportHTML(reportData);
    
    // Créer un blob avec le contenu HTML
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Ouvrir dans un nouvel onglet pour impression
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.document.title = 'Rapport Avances de Salaire';
      // Déclencher l'impression automatiquement
      setTimeout(() => {
        newWindow.print();
      }, 1000);
    }
    
    // Nettoyer l'URL
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  generateReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${data.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          :root {
            --bg: #ffffff;
            --text: #1e1e1e;
            --text-light: #6b7280;
            --border: #e5e7eb;
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08);
            --gradient-main: linear-gradient(90deg, #4b2067 0%, #a728a7 60%, #fbb034 100%);
            --sopra-purple: #4b2067;
            --sopra-pink: #a728a7;
            --sopra-orange: #fbb034;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f9fafb;
            color: var(--text);
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: var(--bg);
            box-shadow: var(--shadow-lg);
            min-height: 100vh;
            position: relative;
          }
          
          .header {
            background: var(--gradient-main);
            color: white;
            padding: 40px;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(75, 32, 103, 0.9) 0%, rgba(167, 40, 167, 0.8) 50%, rgba(251, 176, 52, 0.7) 100%);
            z-index: 1;
          }
          
          .header-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          
          .sopra-logo {
            height: 60px;
            width: auto;
            filter: brightness(0) invert(1);
          }
          
          .sopra-logo-svg {
            height: 60px;
            width: auto;
          }
          
          .report-meta {
            font-size: 15px;
            font-weight: 400;
            opacity: 0.9;
            color: white;
            text-align: right;
          }
          
          .report-meta div {
            margin-bottom: 4px;
          }
          
          .report-title {
            font-size: 32px;
            font-weight: 300;
            margin: 0;
            color: white;
            text-align: center;
            position: relative;
            z-index: 2;
          }
          
          .main-content {
            padding: 40px;
            background: white;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            border-left: 4px solid var(--sopra-purple);
            padding-left: 12px;
            margin-bottom: 24px;
            color: var(--text);
          }
          
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
            margin-bottom: 30px;
          }
          
          .metric-card {
            background: white;
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: var(--shadow);
            padding: 20px;
            transition: transform 0.2s ease;
          }
          
          .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .card-title {
            font-size: 12px;
            color: var(--text-light);
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .card-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 4px;
          }
          
          .card-subtitle {
            font-size: 12px;
            color: var(--text-light);
            font-weight: 400;
          }
          
          .trend-indicator {
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }
          
          .trend-positive { 
            background-color: #dcfce7;
            color: #166534; 
          }
          .trend-negative { 
            background-color: #fee2e2;
            color: #991b1b; 
          }
          .trend-neutral { 
            background-color: #f3f4f6;
            color: #475569; 
          }
          
          .insight-item {
            background: white;
            border-left: 4px solid var(--sopra-purple);
            padding: 16px;
            font-size: 14px;
            box-shadow: var(--shadow);
            margin-bottom: 16px;
            border-radius: 0 8px 8px 0;
          }
          
          .table-container {
            overflow-x: auto;
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: var(--shadow);
            background: white;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
          }
          
          thead {
            background: var(--gradient-main);
            color: white;
          }
          
          th {
            padding: 16px 20px;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 14px 20px;
            font-size: 13px;
            border-bottom: 1px solid var(--border);
          }
          
          tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          tbody tr:hover {
            background: #f1f5f9;
          }
          
          .status-pill {
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 20px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-approved {
            background-color: #dcfce7;
            color: #166534;
          }
          
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          
          .status-rejected {
            background-color: #fee2e2;
            color: #991b1b;
          }
          
          .progress-bar {
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            width: 100px;
            display: inline-block;
          }
          
          .progress-fill {
            height: 100%;
            background: var(--gradient-main);
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          .footer {
            border-top: 1px solid var(--border);
            font-size: 13px;
            color: var(--text-light);
            padding: 24px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
          }
          
          .footer-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .footer-logo {
            height: 24px;
            width: auto;
          }
          
          .footer a {
            text-decoration: none;
            color: var(--sopra-purple);
            font-weight: 500;
            transition: color 0.2s ease;
          }
          
          .footer a:hover {
            color: var(--sopra-pink);
          }
          
          @media print {
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            
            .report-container {
              box-shadow: none;
              max-width: none;
            }
            
            .header {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .metric-card {
              break-inside: avoid;
            }
            
            .table-container {
              break-inside: avoid;
            }
          }
          
          @media screen and (max-width: 768px) {
            .cards-grid {
              grid-template-columns: 1fr;
            }
            
            .header {
              padding: 20px;
            }
            
            .main-content {
              padding: 20px;
            }
            
            .footer {
              flex-direction: column;
              gap: 12px;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="header-content">
              <img src="assets/images/logos/logo.png" alt="Sopra HR Logo" class="sopra-logo" />
              <div class="report-meta">
                <div>Généré le ${data.date}</div>
                <div>Pour : ${data.user?.firstName} ${data.user?.lastName}</div>
              </div>
            </div>
            <h1 class="report-title">${data.title}</h1>
          </div>
          
          <div class="main-content">
            <section class="section">
              <h2 class="section-title">Vue d'ensemble</h2>
              <div class="cards-grid">
                <div class="metric-card">
                  <div class="card-title">Total des demandes</div>
                  <div class="card-value">${data.summary.totalRequests}</div>
                  <div class="card-subtitle">demandes traitées</div>
                </div>
                
                <div class="metric-card">
                  <div class="card-title">Moyenne mensuelle</div>
                  <div class="card-value">${data.summary.averageMonthlyRequests}</div>
                  <div class="card-subtitle">par mois</div>
                </div>
                
                <div class="metric-card">
                  <div class="card-title">Tendance</div>
                  <div class="card-value">${data.summary.trendPercentage}%</div>
                  <div class="card-subtitle">évolution</div>
                  <div class="trend-indicator trend-${data.summary.trendDirection}">
                    ${data.summary.trendDirection === 'positive' ? 'Croissance' : data.summary.trendDirection === 'negative' ? 'Baisse' : 'Stable'}
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="card-title">Taux d'approbation</div>
                  <div class="card-value">${data.summary.approvalRate}%</div>
                  <div class="card-subtitle">demandes approuvées</div>
                </div>
              </div>
            </section>
            
            <section class="section">
              <h2 class="section-title">Analyses et recommandations</h2>
              ${data.insights.map((insight: any) => `
                <div class="insight-item">
                  <strong>${insight.message}</strong>
                </div>
              `).join('')}
            </section>
            
            <section class="section">
              <h2 class="section-title">Historique des demandes</h2>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.requests.map((req: any) => `
                      <tr>
                        <td><strong>#${req.id}</strong></td>
                        <td><strong>${req.requestedAmount} TND</strong></td>
                        <td>
                          <span class="status-pill status-${req.status.toLowerCase()}">
                            ${req.status === 'APPROVED' ? 'Approuvée' : req.status === 'PENDING' ? 'En attente' : 'Rejetée'}
                          </span>
                        </td>
                        <td>${new Date(req.requestDate).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div class="progress-bar">
                            <div class="progress-fill" style="width: ${req.repaymentProgress || 0}%"></div>
                          </div>
                          <span style="margin-left: 8px; font-size: 11px; color: var(--text-light);">${req.repaymentProgress || 0}%</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          
          <div class="footer">
            <div class="footer-left">
              <img src="assets/images/logos/logo.png" alt="Sopra HR" class="footer-logo" />
              <span>© 2025 Sopra HR Software</span>
            </div>
            <a href="https://www.soprahr.com/" target="_blank">www.soprahr.com</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Méthodes pour les filtres intelligents
  showSmartFilters(): void {
    this.showFilters = true;
    // Réinitialiser les filtres à l'ouverture
    this.resetFilters();
  }

  closeFilters(): void {
    this.showFilters = false;
  }

  applySmartFilters(): void {
    try {
      // Valider les filtres d'abord
      const validation = this.validateFilters();
      if (!validation.isValid) {
        this.showError(validation.errors.join(', '));
        return;
      }

      // Appliquer les filtres intelligents
      let filtered = [...this.myRequests];
      let appliedFilters = [];
      
      // Filtre par statut
      if (this.smartFilters.status && this.smartFilters.status.trim() !== '') {
        filtered = filtered.filter(req => req.status === this.smartFilters.status);
        appliedFilters.push(`Statut: ${this.smartFilters.status}`);
      }
      
      // Filtre par période
      if (this.smartFilters.period && this.smartFilters.period.trim() !== '') {
        const days = parseInt(this.smartFilters.period);
        if (!isNaN(days) && days > 0) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          
          filtered = filtered.filter(req => {
            if (!req.requestDate) return false;
            const reqDate = new Date(req.requestDate);
            return reqDate >= cutoffDate;
          });
          appliedFilters.push(`Période: ${days} derniers jours`);
        }
      }
      
      // Filtre par montant minimum
      if (this.smartFilters.minAmount && this.smartFilters.minAmount > 0) {
        filtered = filtered.filter(req => {
          if (!req.requestedAmount) return false;
          return req.requestedAmount >= this.smartFilters.minAmount;
        });
        appliedFilters.push(`Montant minimum: ${this.smartFilters.minAmount} TND`);
      }
      
      // Filtre par montant maximum
      if (this.smartFilters.maxAmount && this.smartFilters.maxAmount > 0) {
        filtered = filtered.filter(req => {
          if (!req.requestedAmount) return false;
          return req.requestedAmount <= this.smartFilters.maxAmount;
        });
        appliedFilters.push(`Montant maximum: ${this.smartFilters.maxAmount} TND`);
      }
      
      // Filtre par progression de remboursement
      if (this.smartFilters.progress && this.smartFilters.progress.trim() !== '') {
        filtered = filtered.filter(req => {
          const progress = this.getProgressPercentage(req);
          switch (this.smartFilters.progress) {
            case '0-25': return progress >= 0 && progress <= 25;
            case '25-50': return progress > 25 && progress <= 50;
            case '50-75': return progress > 50 && progress <= 75;
            case '75-100': return progress > 75 && progress < 100;
            case '100': return progress === 100;
            default: return true;
          }
        });
        appliedFilters.push(`Progression: ${this.smartFilters.progress}`);
      }
      
      // Filtre par motif
      if (this.smartFilters.reason && this.smartFilters.reason.trim() !== '') {
        filtered = filtered.filter(req => {
          if (!req.reason) return false;
          return req.reason.toLowerCase().includes(this.smartFilters.reason.toLowerCase());
        });
        appliedFilters.push(`Motif: ${this.smartFilters.reason}`);
      }
      
      this.filteredRequests = filtered;
      
      // Afficher le message de succès avec les filtres appliqués
      this.showSuccessMessage = true;
      this.isErrorMessage = false;
      if (appliedFilters.length > 0) {
        this.successMessage = `✅ Filtres appliqués avec succès ! ${filtered.length} demande(s) trouvée(s). Filtres: ${appliedFilters.join(', ')}`;
      } else {
        this.successMessage = `ℹ️ Aucun filtre appliqué. Affichage de toutes les demandes (${filtered.length}).`;
      }
      
      // Fermer la modal après 3 secondes
      setTimeout(() => {
        this.showFilters = false;
        this.showSuccessMessage = false;
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
      this.showError('Erreur lors de l\'application des filtres. Veuillez réessayer.');
    }
  }

  applySuggestion(type: string): void {
    // Réinitialiser d'abord
    this.resetFilters();
    
    switch (type) {
      case 'recent':
        this.smartFilters.period = '30';
        break;
      case 'high-amount':
        this.smartFilters.minAmount = 1000;
        break;
      case 'pending':
        this.smartFilters.status = 'PENDING';
        break;
      case 'completed':
        this.smartFilters.progress = '100';
        break;
    }
    
    // Ne pas appliquer automatiquement, juste pré-remplir les filtres
    this.showSuccessMessage = true;
    this.isErrorMessage = false;
    this.successMessage = 'Suggestion appliquée. Cliquez sur "Appliquer" pour voir les résultats.';
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 2000);
  }

  resetFilters(): void {
    this.smartFilters = {
      status: '',
      period: '',
      minAmount: null,
      maxAmount: null,
      progress: '',
      reason: ''
    };
    this.filteredRequests = [...this.myRequests];
    
    this.showSuccessMessage = true;
    this.isErrorMessage = false;
    this.successMessage = 'Filtres réinitialisés. Affichage de toutes les demandes.';
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 2000);
  }

  // Méthode de validation des filtres
  validateFilters(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validation du montant minimum et maximum
    if (this.smartFilters.minAmount && this.smartFilters.maxAmount) {
      if (this.smartFilters.minAmount > this.smartFilters.maxAmount) {
        errors.push('Le montant minimum ne peut pas être supérieur au montant maximum');
      }
    }
    
    // Validation de la période
    if (this.smartFilters.period) {
      const days = parseInt(this.smartFilters.period);
      if (isNaN(days) || days <= 0) {
        errors.push('La période doit être un nombre positif');
      }
    }
    
    // Validation des montants
    if (this.smartFilters.minAmount && (isNaN(this.smartFilters.minAmount) || this.smartFilters.minAmount < 0)) {
      errors.push('Le montant minimum doit être un nombre positif');
    }
    
    if (this.smartFilters.maxAmount && (isNaN(this.smartFilters.maxAmount) || this.smartFilters.maxAmount < 0)) {
      errors.push('Le montant maximum doit être un nombre positif');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Méthode pour afficher les erreurs
  showError(message: string): void {
    this.showSuccessMessage = true;
    this.isErrorMessage = true;
    this.successMessage = `❌ ${message}`;
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.isErrorMessage = false;
    }, 4000);
  }


}
