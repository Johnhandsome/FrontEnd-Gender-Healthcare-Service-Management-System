import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-test-doctor-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">🧪 Doctor Profile Test</h1>

      <div class="space-y-4">
        <!-- Test Buttons -->
        <div class="space-x-4">
          <button
            (click)="testDoctorProfile()"
            [disabled]="loading"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
            {{ loading ? 'Testing...' : 'Test Doctor Profile Data Fetching' }}
          </button>

          <button
            (click)="testDoctorDetailsExists()"
            [disabled]="loading"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400">
            {{ loading ? 'Testing...' : 'Check Doctor Details Exists' }}
          </button>

          <button
            (click)="testUpsertDoctorDetails()"
            [disabled]="loading"
            class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400">
            {{ loading ? 'Testing...' : 'Test Upsert Doctor Details' }}
          </button>
        </div>

        <!-- Error Display -->
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {{ error }}
        </div>

        <!-- Success Display -->
        <div *ngIf="result && !error" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>✅ Success!</strong> Doctor profile data fetched successfully.
        </div>

        <!-- Data Display -->
        <div *ngIf="result" class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-3">📊 Fetched Data:</h3>

          <!-- Staff Information -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-800">Staff Information:</h4>
            <div class="ml-4 text-sm text-gray-600">
              <p><strong>Name:</strong> {{ result.full_name }}</p>
              <p><strong>Working Email:</strong> {{ result.working_email }}</p>
              <p><strong>Role:</strong> {{ result.role }}</p>
              <p><strong>Experience:</strong> {{ result.years_experience }} years</p>
              <p><strong>Gender:</strong> {{ result.gender }}</p>
              <p><strong>Languages:</strong> {{ result.languages | json }}</p>
              <p><strong>Image Link:</strong> {{ result.image_link || 'Not provided' }}</p>
            </div>
          </div>

          <!-- Doctor Details -->
          <div *ngIf="result.doctor_details" class="mb-4">
            <h4 class="font-medium text-gray-800">Doctor Details:</h4>
            <div class="ml-4 text-sm text-gray-600">
              <p><strong>Department:</strong> {{ result.doctor_details.department }}</p>
              <p><strong>Speciality:</strong> {{ result.doctor_details.speciality }}</p>
              <p><strong>License No:</strong> {{ result.doctor_details.license_no }}</p>
              <p><strong>Bio:</strong> {{ result.doctor_details.bio }}</p>
              <p><strong>Slogan:</strong> {{ result.doctor_details.slogan }}</p>
            </div>
          </div>

          <!-- JSON Fields -->
          <div *ngIf="result.doctor_details" class="mb-4">
            <h4 class="font-medium text-gray-800">JSON Fields:</h4>
            <div class="ml-4 text-sm text-gray-600">
              <p><strong>About Me:</strong></p>
              <pre class="bg-gray-100 p-2 rounded text-xs">{{ result.doctor_details.about_me | json }}</pre>
              <p><strong>Educations:</strong></p>
              <pre class="bg-gray-100 p-2 rounded text-xs">{{ result.doctor_details.educations | json }}</pre>
              <p><strong>Certifications:</strong></p>
              <pre class="bg-gray-100 p-2 rounded text-xs">{{ result.doctor_details.certifications | json }}</pre>
            </div>
          </div>

          <!-- Raw Data -->
          <details class="mt-4">
            <summary class="cursor-pointer font-medium text-gray-800">🔍 View Raw Data</summary>
            <pre class="bg-gray-100 p-4 rounded text-xs mt-2 overflow-auto">{{ result | json }}</pre>
          </details>
        </div>
      </div>
    </div>
  `
})
export class TestDoctorProfileComponent implements OnInit {
  loading = false;
  error: string | null = null;
  result: any = null;

  // Extracted test email to a constant
  readonly TEST_EMAIL = 'Kisma@example.com';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    console.log('🧪 Test Doctor Profile Component initialized');
  }

  async testDoctorProfile() {
    this.loading = true;
    this.error = null;
    this.result = null;

    try {
      console.log('🔍 Testing doctor profile data fetching...');

      // First, let's try to get staff by email to find the staff_id
      const staffByEmail = await this.supabaseService.getStaffByEmail(this.TEST_EMAIL);

      if (staffByEmail) {
        console.log('✅ Found staff by email:', staffByEmail);
        const staffId = staffByEmail.staff_id;

        // Now fetch the complete doctor profile
        const doctorProfile = await this.supabaseService.getDoctorProfile(staffId);

        console.log('✅ Doctor profile fetched:', doctorProfile);
        this.result = doctorProfile;
      } else {
        throw new Error('Staff member not found with email Kisma@example.com');
      }

    } catch (error: any) {
      console.error('❌ Test failed:', error);
      this.error = error.message || 'Unknown error occurred';
    } finally {
      this.loading = false;
    }
  }

  async testDoctorDetailsExists() {
    this.loading = true;
    this.error = null;
    this.result = null;

    try {
      console.log('🔍 Testing doctor_details existence check...');

      const staffByEmail = await this.supabaseService.getStaffByEmail('Kisma@example.com');

      if (staffByEmail) {
        const staffId = staffByEmail.staff_id;
        const exists = await this.supabaseService.checkDoctorDetailsExists(staffId);

        console.log('✅ Doctor details exists check:', exists);
        this.result = {
          staff_id: staffId,
          doctor_details_exists: exists,
          message: exists ? 'Doctor details record EXISTS' : 'Doctor details record DOES NOT EXIST'
        };
      } else {
        throw new Error('Staff member not found with email Kisma@example.com');
      }

    } catch (error: any) {
      console.error('❌ Test failed:', error);
      this.error = error.message || 'Unknown error occurred';
    } finally {
      this.loading = false;
    }
  }

  async testUpsertDoctorDetails() {
    this.loading = true;
    this.error = null;
    this.result = null;

    try {
      console.log('🔍 Testing doctor_details upsert functionality...');

      const staffByEmail = await this.supabaseService.getStaffByEmail('Kisma@example.com');

      if (staffByEmail) {
        const staffId = staffByEmail.staff_id;

        // Test data for doctor_details
        const testDoctorData = {
          department: 'reproductive_health',
          speciality: 'hormone_therapy',
          license_no: 'TEST-LICENSE-' + Date.now(),
          bio: 'Test bio updated at ' + new Date().toISOString(),
          slogan: 'Test slogan for upsert functionality'
        };

        const testStaffData = {
          years_experience: 5
        };

        // Perform the upsert
        await this.supabaseService.updateDoctorProfile(staffId, testStaffData, testDoctorData);

        // Fetch the updated profile to verify
        const updatedProfile = await this.supabaseService.getDoctorProfile(staffId);

        console.log('✅ Upsert successful, updated profile:', updatedProfile);
        this.result = {
          operation: 'UPSERT_SUCCESS',
          test_data_sent: testDoctorData,
          staff_data_sent: testStaffData,
          updated_profile: updatedProfile,
          message: 'Doctor details upsert completed successfully!'
        };
      } else {
        throw new Error('Staff member not found with email Kisma@example.com');
      }

    } catch (error: any) {
      console.error('❌ Upsert test failed:', error);
      this.error = error.message || 'Unknown error occurred';
    } finally {
      this.loading = false;
    }
  }
}
