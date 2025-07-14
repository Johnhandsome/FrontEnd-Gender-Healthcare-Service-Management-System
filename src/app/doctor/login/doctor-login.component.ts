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

        <!-- Demo Credentials -->
        <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-6">
          <p class="font-semibold mb-2">🔑 Demo Credentials:</p>
          <p><strong>Dr. Kisma (Sugma):</strong> Kisma&#64;example.com / 123456</p>
          <p class="text-xs mt-2 text-green-600">✅ Connected to real database with demo authentication</p>
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
            (click)="onButtonClick()"
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

  constructor() {
    console.log('🏥 DoctorLoginComponent initialized');
  }

  onButtonClick() {
    console.log('🖱️ Submit button clicked!');
  }

  async onSubmit(form: NgForm) {
    console.log('🚀 Form submission triggered!');
    console.log('📋 Form data:', form.value);
    console.log('✅ Form valid:', form.valid);

    this.formSubmitted = true;
    this.errorMessage = '';

    if (form.valid) {
      this.isSubmitting = true;
      const { email, password } = form.value;

      try {
        console.log('🔍 Login attempt:', { email, password });

        // Real database authentication
        const staff = await this.supabaseService.getStaffByEmail(email);
        console.log('👤 Staff found:', staff);

        if (!staff || staff.role !== 'doctor') {
          console.log('❌ Access denied - not a doctor or staff not found');
          this.errorMessage = 'Access denied. Doctor credentials required.';
          this.isSubmitting = false;
          return;
        }

        console.log('✅ Doctor role confirmed');

        // Demo authentication logic - in production, use proper password hashing
        const isValidPassword = this.validateDemoPassword(staff.working_email, password);
        console.log('🔑 Password validation result:', isValidPassword);

        if (isValidPassword) {
          console.log('✅ Authentication successful, setting session...');

          // Set doctor session
          localStorage.setItem('role', 'doctor');
          localStorage.setItem('doctor_id', staff.staff_id);
          localStorage.setItem('staff_id', staff.staff_id);
          localStorage.setItem('user_name', staff.full_name);
          localStorage.setItem('user_email', staff.working_email);

          console.log('🚀 Redirecting to dashboard...');
          // Redirect to doctor dashboard
          this.router.navigate(['/doctor/dashboard']);
        } else {
          console.log('❌ Password validation failed');
          this.errorMessage = 'Invalid email or password';
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  /**
   * Demo password validation - in production, use proper authentication
   * Currently supports the test account: Kisma@example.com / 123456
   */
  private validateDemoPassword(email: string, password: string): boolean {
    console.log('🔑 validateDemoPassword called with:', { email, password });

    // Demo credentials for development
    const demoCredentials = {
      'Kisma@example.com': '123456'
    };

    console.log('📋 Available demo credentials:', demoCredentials);
    console.log('🔍 Looking for email:', email);
    console.log('🔍 Expected password for this email:', demoCredentials[email as keyof typeof demoCredentials]);
    console.log('🔍 Provided password:', password);

    const result = demoCredentials[email as keyof typeof demoCredentials] === password;
    console.log('✅ Password match result:', result);

    return result;
  }
}
