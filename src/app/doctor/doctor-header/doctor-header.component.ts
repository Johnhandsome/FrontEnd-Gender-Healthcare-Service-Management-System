import { CommonModule } from '@angular/common';
import { Component, inject, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-doctor-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-header.component.html',
  styleUrls: ['./doctor-header.component.css']
})
export class DoctorHeaderComponent implements OnInit {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);

  showNotificationMenu: boolean = false;
  showProfileMenu: boolean = false;
  isNavigating: boolean = false;

  ngOnInit() {
    // Component initialized
  }
  notifications: string[] = [
    'New message from John',
    'Your order has been shipped',
    'New comment on your post'
  ];

  // Get doctor name from localStorage
  get doctorName(): string {
    return localStorage.getItem('user_name') || 'Doctor';
  }

  // Get doctor email from localStorage
  get doctorEmail(): string {
    return localStorage.getItem('user_email') || '';
  }

  toggleNotificationMenu() {
    this.showNotificationMenu = !this.showNotificationMenu;
    this.showProfileMenu = false; // Close profile menu if open
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotificationMenu = false; // Close notification menu if open
  }

  // Navigate to profile page and close dropdown
  navigateToProfile() {
    this.isNavigating = true;
    this.showProfileMenu = false;
    this.showNotificationMenu = false;

    this.router.navigate(['/doctor/dashboard/profile']).then(() => {
      // Reset navigation state after a brief delay
      setTimeout(() => {
        this.isNavigating = false;
      }, 300);
    });
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.profile-dropdown') || target.closest('.notification-dropdown') ||
                         target.closest('.profile-btn') || target.closest('.notification-btn');

    if (!clickedInside) {
      this.showProfileMenu = false;
      this.showNotificationMenu = false;
    }
  }

  async logout() {
    console.log('🚪 Doctor logout initiated');

    try {
      // Sign out from Supabase Auth if authenticated
      await this.supabaseService.signOut();
      console.log('✅ Supabase Auth session cleared');
    } catch (error) {
      console.log('⚠️ Supabase signout error (continuing with logout):', error);
    }

    // Clear all doctor session data
    localStorage.removeItem('role');
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('staff_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('doctor_redirect_url');

    console.log('✅ Session data cleared, redirecting to login');

    // Close all open menus
    this.showProfileMenu = false;
    this.showNotificationMenu = false;

    // Redirect to unified login
    this.router.navigate(['/login']).then(success => {
      if (success) {
        console.log('✅ Successfully redirected to login page');
      } else {
        console.error('❌ Failed to redirect, using fallback');
        // Fallback: force navigation using window.location
        window.location.href = '/login';
      }
    });
  }
}
