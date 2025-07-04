import { Component, OnInit } from '@angular/core';
// Temporarily commented out until dependencies are properly installed
// import { NgChartsModule } from 'ng2-charts';
import { CommonModule, getLocaleNumberSymbol } from '@angular/common';
import { SupabaseService } from '../../../supabase.service';


@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule], // NgChartsModule temporarily removed
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements OnInit {
  ageDist: any;
  genderDist: any;
  cancelRate = 0;
  avgDuration = 0;
  staffStats: any;

  // Chart data and options
  ageDistChartData = {
    labels: ['0-18', '19-35', '36-60', '60+'],
    datasets: [
      { data: [40, 30, 20, 10] }
    ]
  }

  genderDistChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      { data: [55, 45] }
    ]
  }

  pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as 'top' },
      tooltip: { enabled: true }
    }
  };

  maxAvgDuration = 120; // ví dụ: 120 phút là max để progress bar đẹp

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    this.ageDist = await this.supabaseService.getAgeDistribution();
    this.genderDist = await this.supabaseService.getGenderDistribution();

    const start = new Date();
    start.setDate(start.getDate() - 30);
    const end = new Date();

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    this.cancelRate = await this.supabaseService.getCancelledRate(startISO, endISO);
    this.avgDuration = await this.supabaseService.getAvgAppointmentDuration();
    this.staffStats = await this.supabaseService.getStaffWorkloadBalance();
  }
}
