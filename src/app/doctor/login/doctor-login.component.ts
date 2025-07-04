import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-doctor-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
      <div class="w-full max-w-md mx-auto px-8 py-10 bg-white border border-gray-200 rounded-xl shadow-2xl">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <img src="./logoNgang.png" alt="GenderCare Logo" class="h-20 mb-4" />
          <h2 class="text-2xl font-bold text-gray-800">Doctor Portal</h2>
          <p class="text-gray-600 text-sm">Access your practice dashboard</p>
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors pr-12"
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
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
          <a routerLink="/" class="text-green-600 hover:text-green-800 text-sm">
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
export class DoctorLoginComponent {
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
        // Check if user exists in staff_members table with doctor role
        const staff = await this.supabaseService.getStaffByEmail(email);

        if (!staff || staff.role !== 'doctor') {
          this.errorMessage = 'Access denied. Doctor credentials required.';
          this.isSubmitting = false;
          return;
        }

        // For demo purposes, we'll use a simple password check
        // In production, you should use proper password hashing
        if (password === 'doctor123' || staff.password === password) {
          // Set doctor session
          localStorage.setItem('role', 'doctor');
          localStorage.setItem('doctor_id', staff.staff_id);
          localStorage.setItem('staff_id', staff.staff_id);
          localStorage.setItem('user_name', staff.full_name);

          // Redirect to doctor dashboard
          this.router.navigate(['/doctor/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
