// angular import
import { Component, OnInit, viewChild, Input } from '@angular/core';

// project import

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-income-overview-chart',
  imports: [CardComponent, NgApexchartsModule],
  templateUrl: './income-overview-chart.component.html',
  styleUrl: './income-overview-chart.component.scss'
})
export class IncomeOverviewChartComponent implements OnInit {
  // public props
  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;
  @Input() series: any[] = [];
  @Input() categories: string[] = [];

  // life cycle hook
  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'bar',
        height: 365,
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      series: this.series.length ? this.series : [
        { data: [80, 95, 70, 42, 65, 55, 78] }
      ],
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: this.categories.length ? this.categories : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: ['#8c8c8c', '#8c8c8c', '#8c8c8c', '#8c8c8c', '#8c8c8c', '#8c8c8c', '#8c8c8c']
          }
        }
      },
      yaxis: {
        show: false
      },
      colors: ['#5cdbd3'],
      grid: {
        show: false
      },
      tooltip: {
        theme: 'light'
      }
    };
  }
}
