// angular import
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { 
  SearchOutline, 
  BellOutline, 
  DownloadOutline, 
  FileTextOutline, 
  CheckCircleOutline, 
  DollarOutline, 
  ArrowRightOutline,
  RiseOutline,
  PieChartOutline,
  FilterOutline,
  EyeOutline,
  EditOutline,
  TagOutline,
  ClockCircleOutline,
  AlertOutline
} from '@ant-design/icons-angular/icons';
import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from 'src/app/theme/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from 'src/app/theme/shared/apexchart/sales-report-chart/sales-report-chart.component';
import { SalaryAdvanceService } from 'src/app/core/services/salary-advance.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-hr-statistics',
  standalone: true,
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
  templateUrl: './hr-statistics.html',
  styleUrls: ['./hr-statistics.scss']
})
export class HrStatistics implements OnInit {
  today: Date = new Date();
  userFirstName: string = 'Prénom';
  userLastName: string = 'Nom';
  userFullName: string = 'Utilisateur';
  welcomeImage: string = '';
  cardImages = [
    'assets/images/welcome/8d0f3c19-2547-4b20-8911-9713329c4ca6_800w.jpg',
    'assets/images/welcome/9dead2ce-9640-41bd-8153-af6e7acc42cf_800w.jpg',
    'assets/images/welcome/86c20217-e734-45e2-a50b-0e5602db415c_800w.jpg'
  ];
  private salaryAdvanceService = inject(SalaryAdvanceService);
  private iconService = inject(IconService);
  private authService = inject(AuthService);

  constructor() {
    // Ajouter les icônes Ant Design
    this.iconService.addIcon(...[
      SearchOutline, 
      BellOutline, 
      DownloadOutline, 
      FileTextOutline, 
      CheckCircleOutline, 
      DollarOutline, 
      ArrowRightOutline,
      RiseOutline,
      PieChartOutline,
      FilterOutline,
      EyeOutline,
      EditOutline,
      TagOutline,
      ClockCircleOutline,
      AlertOutline
    ]);
  }

  // Widgets
  widgets: any[] = [];
  // Charts
  trends: number[] = [];
  statusDistribution: number[] = [];
  approvalRate: number = 0;
  totalRequestedAmount: number = 0;
  totalApprovedAmount: number = 0;
  averageRequestedAmount: number = 0;
  averageApprovedAmount: number = 0;
  outstandingAdvances: number = 0;

  // Table des demandes récentes
  recentRequests: any[] = [];



  // Historique des actions RH (mock data for now)
  rhActions: any[] = [
    {
      avatar: 'assets/images/user/avatar-1.jpg',
      title: 'Validation d\'une demande',
      date: new Date(),
      badge: 'bg-success',
      status: 'Validée'
    },
    {
      avatar: 'assets/images/user/avatar-2.jpg',
      title: 'Rejet d\'une demande',
      date: new Date(),
      badge: 'bg-danger',
      status: 'Rejetée'
    },
    {
      avatar: 'assets/images/user/avatar-3.jpg',
      title: 'Demande en attente',
      date: new Date(),
      badge: 'bg-warning',
      status: 'En attente'
    }
  ];

  ngOnInit() {
    // Récupérer l'utilisateur connecté
    const user = this.authService.getCurrentUser();
    
    // Mettre à jour les noms avec les vraies données de l'utilisateur
    if (user) {
      this.userFirstName = user.firstName || 'Prénom';
      this.userLastName = user.lastName || 'Nom';
      // Utiliser le nom complet s'il existe, sinon construire à partir du prénom et nom
      this.userFullName = user.name && user.name.trim() !== '' 
        ? user.name 
        : `${this.userFirstName} ${this.userLastName}`.trim();
      
      console.log('Utilisateur connecté:', {
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        userFullName: this.userFullName
      });
    }

    // Set image based on day of week (1 = Monday, 7 = Sunday)
    const day = this.today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const imageMap = [
      '7.jpg', // Sunday (0)
      '7.jpg', // Monday (1)
      '2.jpg', // Tuesday (2)
      '3.jpg', // Wednesday (3)
      '4.jpg', // Thursday (4)
      '5.jpg', // Friday (5)
      '6.jpg', // Saturday (6)
    ];
    this.welcomeImage = 'assets/images/welcome/' + imageMap[day];

    // Récupérer les statistiques globales
    this.salaryAdvanceService.getAnalytics().subscribe((data) => {
      this.widgets = [
        {
          titre: 'Demandes totales',
          valeur: data.totalRequests,
          icone: 'ti ti-list',
          couleur: 'bg-light-primary',
        },
        {
          titre: 'Validées',
          valeur: data.approvedRequests,
          icone: 'ti ti-check',
          couleur: 'bg-light-success',
        },
        {
          titre: 'Rejetées',
          valeur: data.rejectedRequests,
          icone: 'ti ti-x',
          couleur: 'bg-light-danger',
        },
        {
          titre: 'En attente',
          valeur: data.pendingRequests,
          icone: 'ti ti-clock',
          couleur: 'bg-light-warning',
        },
        {
          titre: 'Montant total demandé',
          valeur: data.totalRequestedAmount + ' TND',
          icone: 'ti ti-currency-dollar',
          couleur: 'bg-light-primary',
        },
        {
          titre: 'Montant total approuvé',
          valeur: data.totalApprovedAmount + ' TND',
          icone: 'ti ti-currency-dollar',
          couleur: 'bg-light-success',
        },
        {
          titre: 'Montant moyen demandé',
          valeur: data.averageRequestedAmount + ' TND',
          icone: 'ti ti-chart-bar',
          couleur: 'bg-light-primary',
        },
        {
          titre: 'Montant moyen approuvé',
          valeur: data.averageApprovedAmount + ' TND',
          icone: 'ti ti-chart-bar',
          couleur: 'bg-light-success',
        },
        {
          titre: 'Avances non remboursées',
          valeur: data.outstandingAdvances + ' TND',
          icone: 'ti ti-alert-triangle',
          couleur: 'bg-light-warning',
        },
        {
          titre: 'Taux d\'approbation',
          valeur: Math.round(data.approvalRate * 100) + ' %',
          icone: 'ti ti-percentage',
          couleur: 'bg-light-info',
        }
      ];
      this.trends = data.trends || [];
      this.statusDistribution = data.statusDistribution || [];
      this.approvalRate = data.approvalRate || 0;
      this.totalRequestedAmount = data.totalRequestedAmount || 0;
      this.totalApprovedAmount = data.totalApprovedAmount || 0;
      this.averageRequestedAmount = data.averageRequestedAmount || 0;
      this.averageApprovedAmount = data.averageApprovedAmount || 0;
      this.outstandingAdvances = data.outstandingAdvances || 0;
    });
    // Récupérer les 10 dernières demandes
    this.salaryAdvanceService.getAllRequests().subscribe((all) => {
      this.recentRequests = (all || []).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).slice(0, 10);
    });
  }

  get frenchDate(): string {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const d = this.today;
    return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
  }

  // Méthodes pour les avatars
  getAvatarUrl(email: string, name: string, profilePicture?: string): string {
    if (profilePicture) {
      return profilePicture;
    }
    return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  }

  onImageError(event: any): void {
    event.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  }


}
