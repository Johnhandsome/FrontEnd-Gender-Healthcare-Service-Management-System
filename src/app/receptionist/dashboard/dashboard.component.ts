import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DashboardStats {
  todayAppointments: number;
  pendingCheckIns: number;
  totalPatients: number;
  availableDoctors: number;
  recentAppointments: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <!-- Modern Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Reception Dashboard</h1>
            <p class="text-gray-600">Welcome back! Here's your overview for today.</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <p class="text-sm font-medium text-indigo-700">{{ getCurrentDate() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
        <button (click)="loadDashboardData()" class="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
          Retry
        </button>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading && !error">
        <!-- Modern Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Today's Appointments -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Today's Appointments</h3>
                </div>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.todayAppointments }}</p>
                <p class="text-sm text-indigo-600 font-medium">+12% from yesterday</p>
              </div>
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Check-ins -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Pending Check-ins</h3>
                </div>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.pendingCheckIns }}</p>
                <p class="text-sm text-yellow-600 font-medium">Awaiting arrival</p>
              </div>
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Patients -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Patients</h3>
                </div>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.totalPatients }}</p>
                <p class="text-sm text-green-600 font-medium">Registered patients</p>
              </div>
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Available Doctors -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Available Doctors</h3>
                </div>
                <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.availableDoctors }}</p>
                <p class="text-sm text-purple-600 font-medium">Currently on duty</p>
              </div>
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Appointments -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-gray-900">Recent Appointments</h2>
              </div>
              <button
                (click)="navigateToAppointments()"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                View All
              </button>
            </div>
          </div>
          <div class="p-6">
            <div *ngIf="stats.recentAppointments.length === 0" class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">No recent appointments found.</p>
              <p class="text-sm text-gray-400 mt-1">New appointments will appear here.</p>
            </div>
            <div *ngIf="stats.recentAppointments.length > 0" class="space-y-3">
              <div *ngFor="let appointment of stats.recentAppointments"
                   class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-102 border border-gray-100 hover:border-indigo-200">
                <div class="flex-1">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900">{{ appointment.patient_name }}</p>
                      <p class="text-sm text-indigo-600 font-medium">{{ appointment.visit_type | titlecase }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900">{{ formatDate(appointment.appointment_date) }}</p>
                    <p class="text-sm text-gray-500 font-medium" *ngIf="appointment.appointment_time">{{ formatTime(appointment.appointment_time) }}</p>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold"
                        [ngClass]="getStatusColor(appointment.appointment_status)">
                    {{ appointment.appointment_status | titlecase }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Modern Reception Dashboard Styles */
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Hover scale effect */
    .hover\\:scale-102:hover {
      transform: scale(1.02);
    }

    /* Card hover effects */
    .hover\\:shadow-2xl:hover {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    /* Gradient text */
    .bg-clip-text {
      -webkit-background-clip: text;
      background-clip: text;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;

  stats: DashboardStats = {
    todayAppointments: 0,
    pendingCheckIns: 0,
    totalPatients: 0,
    availableDoctors: 0,
    recentAppointments: []
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      // Simulate API call with demo data
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.stats = {
        todayAppointments: 12,
        pendingCheckIns: 5,
        totalPatients: 248,
        availableDoctors: 3,
        recentAppointments: [
          {
            patient_name: 'John Smith',
            visit_type: 'consultation',
            appointment_date: new Date().toISOString(),
            appointment_time: '09:00',
            appointment_status: 'confirmed'
          },
          {
            patient_name: 'Sarah Johnson',
            visit_type: 'follow-up',
            appointment_date: new Date().toISOString(),
            appointment_time: '10:30',
            appointment_status: 'pending'
          }
        ]
      };

    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error);
      this.error = 'Failed to load dashboard data. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  navigateToAppointments(): void {
    this.router.navigate(['/receptionist/dashboard/appointments']);
  }

  navigateToPatientRegistration(): void {
    this.router.navigate(['/receptionist/dashboard/patient-registration']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }
}
