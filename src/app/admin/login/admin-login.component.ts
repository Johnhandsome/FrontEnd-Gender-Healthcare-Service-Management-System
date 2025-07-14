import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="w-full max-w-md mx-auto px-8 py-10 bg-white border border-gray-200 rounded-xl shadow-2xl">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <img src="./logoNgang.png" alt="GenderCare Logo" class="h-20 mb-4" />
          <h2 class="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p class="text-gray-600 text-sm">Sign in to manage the system</p>
        </div>

        <!-- Demo Credentials -->
        <div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-6">
          <p class="font-semibold mb-2">🔑 Demo Credentials:</p>
          <p><strong>Admin:</strong> admin&#64;gendercare.com / admin123</p>
          <p><strong>Manager:</strong> manager&#64;gendercare.com / manager123</p>
        </div>

        <!-- Login Form -->
        <form #form="ngForm" (ngSubmit)="onSubmit(form)" class="space-y-6">
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              ngModel
              required
              email
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter your email"
              [class.border-red-500]="formSubmitted && emailModel.invalid"
              #emailModel="ngModel"
            />
            <div *ngIf="formSubmitted && emailModel.invalid" class="text-red-500 text-sm">
              <span *ngIf="emailModel.errors?.['required']">Email is required</span>
              <span *ngIf="emailModel.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                ngModel
                required
                minlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-12"
                placeholder="Enter your password"
                [class.border-red-500]="formSubmitted && passwordModel.invalid"
                #passwordModel="ngModel"
              />
              <button
                type="button"
                (click)="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <span *ngIf="!showPassword">👁️</span>
                <span *ngIf="showPassword">🙈</span>
              </button>
            </div>
            <div *ngIf="formSubmitted && passwordModel.invalid" class="text-red-500 text-sm">
              <span *ngIf="passwordModel.errors?.['required']">Password is required</span>
              <span *ngIf="passwordModel.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isSubmitting"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span *ngIf="!isSubmitting">Sign In</span>
            <span *ngIf="isSubmitting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </button>
        </form>

        <!-- Back to Customer Site -->
        <div class="mt-6 text-center">
          <a routerLink="/" class="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Customer Site
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class AdminLoginComponent {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);

  formSubmitted = false;
  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  async onSubmit(form: NgForm) {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (form.valid) {
      this.isSubmitting = true;
      const { email, password } = form.value;

      try {
        // FAKE DATA for testing - Remove in production
        const fakeAdminUsers = [
          { email: 'admin@gendercare.com', password: 'admin123', staff_id: 'admin-001', full_name: 'Admin User', role: 'admin' },
          { email: 'manager@gendercare.com', password: 'manager123', staff_id: 'manager-001', full_name: 'Manager User', role: 'manager' }
        ];

        // Check fake data first
        const fakeUser = fakeAdminUsers.find(user => user.email === email && user.password === password);

        if (fakeUser) {
          // Set admin session
          localStorage.setItem('role', fakeUser.role);
          localStorage.setItem('staff_id', fakeUser.staff_id);
          localStorage.setItem('user_name', fakeUser.full_name);
          localStorage.setItem('user_email', fakeUser.email);

          // Redirect to admin dashboard
          this.router.navigate(['/admin/dashboard']);
          return;
        }

        // Fallback to real database check (commented out for now)
        /*
        const staff = await this.supabaseService.getStaffByEmail(email);

        if (!staff || (staff.role !== 'admin' && staff.role !== 'manager')) {
          this.errorMessage = 'Access denied. Admin credentials required.';
          this.isSubmitting = false;
          return;
        }

        if (staff.password === password) {
          localStorage.setItem('role', 'admin');
          localStorage.setItem('staff_id', staff.staff_id);
          localStorage.setItem('user_name', staff.full_name);
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
        */

        this.errorMessage = 'Invalid email or password. Try: admin@gendercare.com / admin123';
      } catch (error: any) {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
