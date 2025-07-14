import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../stats-card/stats-card.component';
import { MainPanelsComponent } from '../main-panels/main-panels.component';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, MainPanelsComponent],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div *ngIf="!isLoading" class="space-y-6 animate-fadeIn">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p class="text-gray-600">Welcome back! Here's your healthcare system overview.</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <p class="text-sm font-medium text-indigo-700">{{ getCurrentDate() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <app-stats-card></app-stats-card>

      <!-- Main Panels -->
      <app-main-panels></app-main-panels>

      <!-- Notifications Section -->
      <div *ngIf="notifications.length > 0" class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Notifications</h2>
        <div class="space-y-3">
          <div *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
               class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <p class="text-gray-800">{{ notification.message || 'System notification' }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ notification.created_at | date:'short' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Smooth transitions for all elements */
    * {
      transition: all 0.3s ease-in-out;
    }
  `]
})
export class DashboardContentComponent implements OnInit {
  notifications: any[] = [];
  isLoading: boolean = true;

  ngOnInit() {
    // Simulate loading
    setTimeout(() => {
      this.isLoading = false;
      this.loadNotifications();
    }, 800);
  }

  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  loadNotifications() {
    // Sample notifications - replace with real data from Supabase
    this.notifications = [
      {
        id: 1,
        message: 'New staff member registered',
        created_at: new Date(),
        type: 'info'
      },
      {
        id: 2,
        message: 'System backup completed successfully',
        created_at: new Date(Date.now() - 3600000), // 1 hour ago
        type: 'success'
      },
      {
        id: 3,
        message: 'Monthly report generated',
        created_at: new Date(Date.now() - 7200000), // 2 hours ago
        type: 'info'
      }
    ];
  }

  trackByNotificationId(index: number, notification: any): any {
    return notification.id || index;
  }
}
