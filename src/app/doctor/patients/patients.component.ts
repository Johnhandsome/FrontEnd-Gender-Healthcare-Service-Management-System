import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { Patient } from '../../models/patient.interface';
import { PatientReport, CreatePatientReportRequest, ReportStatus } from '../../models/patient-report.interface';
import { PeriodTracking } from '../../models/period-tracking.interface';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading = true;
  error: string | null = null;
  doctorId: string | null = null;

  // Filter properties
  searchTerm = '';
  selectedGender = '';
  selectedStatus = '';

  // Modal properties
  showPatientModal = false;
  showReportModal = false;
  showPeriodModal = false;
  selectedPatient: Patient | null = null;
  patientReports: PatientReport[] = [];
  patientPeriods: PeriodTracking[] = [];
  patientAppointments: any[] = [];

  // Report form
  reportForm: CreatePatientReportRequest = {
    patient_id: '',
    report_content: '',
    report_description: '',
    report_status: ReportStatus.PENDING
  };

  // Gender options
  genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.doctorId = localStorage.getItem('doctor_id') || localStorage.getItem('staff_id');
    if (!this.doctorId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPatients();
  }

  async loadPatients() {
    try {
      this.loading = true;
      this.error = null;
      this.patients = await this.supabaseService.getDoctorPatients(this.doctorId!);
      this.applyFilters();
    } catch (error: any) {
      this.error = error.message || 'Failed to load patients';
      console.error('Patients error:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    this.filteredPatients = this.patients.filter(patient => {
      const matchesSearch = !this.searchTerm ||
        patient.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.phone.includes(this.searchTerm) ||
        patient.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesGender = !this.selectedGender ||
        patient.gender === this.selectedGender;

      const matchesStatus = !this.selectedStatus ||
        patient.patient_status === this.selectedStatus;

      return matchesSearch && matchesGender && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedGender = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  async openPatientModal(patient: Patient) {
    this.selectedPatient = patient;
    this.showPatientModal = true;

    try {
      // Load patient reports
      this.patientReports = await this.supabaseService.getDoctorPatientReports(this.doctorId!);
      this.patientReports = this.patientReports.filter(r => r.patient_id === patient.id);

      // Load patient appointments
      this.patientAppointments = await this.supabaseService.getAppointmentsByDoctor(this.doctorId!);
      this.patientAppointments = this.patientAppointments.filter(a => a.patient_id === patient.id);

      // Load period tracking if patient is female
      if (patient.gender === 'female') {
        this.patientPeriods = await this.supabaseService.getPatientPeriodTracking(patient.id);
      }
    } catch (error: any) {
      console.error('Error loading patient details:', error);
    }
  }

  closePatientModal() {
    this.showPatientModal = false;
    this.selectedPatient = null;
    this.patientReports = [];
    this.patientAppointments = [];
    this.patientPeriods = [];
  }

  openReportModal(patient: Patient) {
    this.selectedPatient = patient;
    this.reportForm = {
      patient_id: patient.id,
      report_content: '',
      report_description: '',
      report_status: ReportStatus.PENDING
    };
    this.showReportModal = true;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.selectedPatient = null;
    this.reportForm = {
      patient_id: '',
      report_content: '',
      report_description: '',
      report_status: ReportStatus.PENDING
    };
  }

  async createReport() {
    if (!this.selectedPatient || !this.reportForm.report_content.trim()) return;

    try {
      await this.supabaseService.createPatientReport(this.doctorId!, this.reportForm);
      this.closeReportModal();
      // Refresh patient data if modal is open
      if (this.showPatientModal && this.selectedPatient) {
        this.openPatientModal(this.selectedPatient);
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to create report';
      console.error('Create report error:', error);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getGenderIcon(gender: string): string {
    switch (gender) {
      case 'male': return '♂';
      case 'female': return '♀';
      default: return '⚧';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  calculateAge(dateOfBirth: string | null): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
