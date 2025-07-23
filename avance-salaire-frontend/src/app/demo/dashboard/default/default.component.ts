// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';

// project import
import tableData from 'src/fake-data/default-data.json';

import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from 'src/app/theme/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from 'src/app/theme/shared/apexchart/sales-report-chart/sales-report-chart.component';
import { SalaryAdvanceService } from 'src/app/core/services/salary-advance.service';

// icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-default',
  imports: [
    CommonModule,
    CardComponent,
    IconDirective,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent,
    AnalyticsChartComponent,
    SalesReportChartComponent
  ],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  private iconService = inject(IconService);
  private salaryAdvanceService = inject(SalaryAdvanceService);

  // constructor
  constructor() {
    this.iconService.addIcon(...[RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline]);
  }

  recentOrder = tableData;

  AnalyticEcommerce: any[] = [];

  transaction = [
    {
      background: 'text-success bg-light-success',
      icon: 'gift',
      title: 'Order #002434',
      time: 'Today, 2:00 AM',
      amount: '+ $1,430',
      percentage: '78%'
    },
    {
      background: 'text-primary bg-light-primary',
      icon: 'message',
      title: 'Order #984947',
      time: '5 August, 1:45 PM',
      amount: '- $302',
      percentage: '8%'
    },
    {
      background: 'text-danger bg-light-danger',
      icon: 'setting',
      title: 'Order #988784',
      time: '7 hours ago',
      amount: '- $682',
      percentage: '16%'
    }
  ];

  ngOnInit() {
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
  }
}
