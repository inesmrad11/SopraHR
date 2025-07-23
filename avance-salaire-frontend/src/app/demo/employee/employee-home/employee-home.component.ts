// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';

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

@Component({
  selector: 'app-employee-home',
  imports: [
    CommonModule,
    CardComponent,
    IconDirective,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent,
    AnalyticsChartComponent,
    SalesReportChartComponent,
    NgApexchartsModule
  ],
  templateUrl: './employee-home.html',
  styleUrls: ['./employee-home.scss']
})
export class EmployeeHomeComponent implements OnInit {
  private iconService = inject(IconService);
  private salaryAdvanceService = inject(SalaryAdvanceService);
  private authService = inject(AuthService);

  today: Date = new Date();
  userFirstName: string = 'Prénom';
  userLastName: string = 'Nom';
  welcomeImage: string = '';

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

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.salaryAdvanceService.getMyRequests().subscribe((requests) => {
      this.myRequests = requests || [];
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
      '1.png', // Monday (1)
      '2.jpg', // Tuesday (2)
      '3.jpg', // Wednesday (3)
      '4.jpg', // Thursday (4)
      '5.jpg', // Friday (5)
      '6.jpg', // Saturday (6)
    ];
    this.welcomeImage = 'assets/images/welcome/' + imageMap[day];
  }

  get frenchDate(): string {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const d = this.today;
    return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
  }
}
