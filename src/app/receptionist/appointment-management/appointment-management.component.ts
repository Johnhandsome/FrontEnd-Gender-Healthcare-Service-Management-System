import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../supabase.service';
import { Patient } from '../../models/patient.interface';
import { Staff } from '../../models/staff.interface';

interface Appointment {
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  visit_type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  appointment_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.css']
})
export class AppointmentManagementComponent implements OnInit {
  // Data properties
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  pendingAppointments: Appointment[] = [];
  patients: Patient[] = [];
  doctors: Staff[] = [];
  isLoading = false;

  // Pagination
  currentPage: number = 1;
  readonly pageSize: number = 10;

  // Filtering
  searchQuery: string = '';
  selectedStatus: string = '';
  selectedDoctor: string = '';
  selectedDate: string = '';

  // Modal states
  showCreateModal = false;
  showApprovalModal = false;
  selectedAppointment: Appointment | null = null;

  // New appointment form
  newAppointment = {
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    visit_type: 'consultation' as const,
    notes: ''
  };

  // Visit types
  visitTypes = [
    { value: 'consultation', label: 'Consultation', color: 'bg-blue-100 text-blue-800' },
    { value: 'follow-up', label: 'Follow-up', color: 'bg-green-100 text-green-800' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' },
    { value: 'routine', label: 'Routine', color: 'bg-gray-100 text-gray-800' }
  ];

  // Status options
  statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  // Statistics
  stats = {
    totalAppointments: 0,
    pendingApprovals: 0,
    todayAppointments: 0,
    confirmedToday: 0
  };

  // Error handling
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadInitialData();
    await this.calculateStats();

    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        this.openCreateModal();
      } else if (params['action'] === 'approve') {
        this.showPendingAppointments();
      }
    });
  }

  async loadInitialData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadAppointments(),
        this.loadPatients(),
        this.loadDoctors()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showError('Failed to load data');
    } finally {
      this.isLoading = false;
    }
  }

  async loadAppointments() {
    try {
      // This would be a custom query to get appointments with patient and doctor info
      // For now, we'll simulate the data structure
      const result = await this.supabaseService.getAllPatients();
      if (result.success && result.data) {
        this.appointments = this.generateAppointments(result.data);
        this.filteredAppointments = [...this.appointments];
        this.pendingAppointments = this.appointments.filter(apt => apt.appointment_status === 'pending');
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      this.showError('Failed to load appointments');
    }
  }

  async loadPatients() {
    try {
      const result = await this.supabaseService.getAllPatients();
      if (result.success && result.data) {
        this.patients = result.data;
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  }

  async loadDoctors() {
    try {
      const result = await this.supabaseService.getAllStaff();
      if (result.success && result.data) {
        this.doctors = result.data.filter(staff => staff.role === 'doctor');
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  }

  generateAppointments(patients: Patient[]): Appointment[] {
    const appointments: Appointment[] = [];

    patients.forEach((patient, index) => {
      // Generate 1-3 appointments per patient
      const appointmentCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < appointmentCount; i++) {
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) - 15);

        appointments.push({
          appointment_id: `APT-${Date.now()}-${index}-${i}`,
          patient_id: patient.id,
          patient_name: patient.full_name,
          patient_email: patient.email || '',
          patient_phone: patient.phone_number || '',
          doctor_id: `DOC-${Math.floor(Math.random() * 3) + 1}`,
          doctor_name: ['Dr. Smith', 'Dr. Johnson', 'Dr. Brown'][Math.floor(Math.random() * 3)],
          appointment_date: appointmentDate.toISOString().split('T')[0],
          appointment_time: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'][Math.floor(Math.random() * 6)],
          visit_type: this.getRandomVisitType(),
          appointment_status: this.getRandomStatus(),
          notes: Math.random() > 0.5 ? 'Regular checkup appointment' : '',
          created_at: patient.created_at || new Date().toISOString(),
          updated_at: patient.updated_at || new Date().toISOString()
        });
      }
    });

    return appointments.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  }

  getRandomVisitType(): 'consultation' | 'follow-up' | 'emergency' | 'routine' {
    const types: ('consultation' | 'follow-up' | 'emergency' | 'routine')[] = ['consultation', 'follow-up', 'emergency', 'routine'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getRandomStatus(): 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' {
    const statuses: ('pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled')[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  async calculateStats() {
    const today = new Date().toISOString().split('T')[0];

    this.stats = {
      totalAppointments: this.appointments.length,
      pendingApprovals: this.appointments.filter(apt => apt.appointment_status === 'pending').length,
      todayAppointments: this.appointments.filter(apt => apt.appointment_date === today).length,
      confirmedToday: this.appointments.filter(apt =>
        apt.appointment_date === today && apt.appointment_status === 'confirmed'
      ).length
    };
  }

  // Pagination methods
  get paginatedAppointments(): Appointment[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAppointments.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAppointments.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Filtering methods
  applyFilters() {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.searchQuery ||
        appointment.patient_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        appointment.patient_email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        appointment.doctor_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        appointment.appointment_id.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.selectedStatus || appointment.appointment_status === this.selectedStatus;
      const matchesDoctor = !this.selectedDoctor || appointment.doctor_id === this.selectedDoctor;
      const matchesDate = !this.selectedDate || appointment.appointment_date === this.selectedDate;

      return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
    });

    this.currentPage = 1;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onDoctorFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  // Modal methods
  openCreateModal() {
    this.resetNewAppointmentForm();
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetNewAppointmentForm();
  }

  openApprovalModal(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.selectedAppointment = null;
  }

  resetNewAppointmentForm() {
    this.newAppointment = {
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      visit_type: 'consultation',
      notes: ''
    };
  }

  showPendingAppointments() {
    this.selectedStatus = 'pending';
    this.applyFilters();
  }

  // CRUD operations
  async createAppointment() {
    if (!this.validateAppointmentForm()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      const patient = this.patients.find(p => p.id === this.newAppointment.patient_id);
      const doctor = this.doctors.find(d => d.staff_id === this.newAppointment.doctor_id);

      if (!patient || !doctor) {
        this.showError('Selected patient or doctor not found');
        return;
      }

      const newAppointmentData: Appointment = {
        appointment_id: `APT-${Date.now()}`,
        patient_id: this.newAppointment.patient_id,
        patient_name: patient.full_name,
        patient_email: patient.email || '',
        patient_phone: patient.phone_number || '',
        doctor_id: this.newAppointment.doctor_id,
        doctor_name: doctor.full_name,
        appointment_date: this.newAppointment.appointment_date,
        appointment_time: this.newAppointment.appointment_time,
        visit_type: this.newAppointment.visit_type,
        appointment_status: 'confirmed', // Receptionist creates confirmed appointments
        notes: this.newAppointment.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.appointments.unshift(newAppointmentData);
      this.applyFilters();
      await this.calculateStats();
      this.closeCreateModal();
      this.showSuccess('Appointment created successfully');
    } catch (error) {
      console.error('Error creating appointment:', error);
      this.showError('Failed to create appointment');
    } finally {
      this.isLoading = false;
    }
  }

  async approveAppointment(appointment: Appointment) {
    try {
      this.isLoading = true;

      const updatedAppointment = {
        ...appointment,
        appointment_status: 'confirmed' as const,
        updated_at: new Date().toISOString()
      };

      const index = this.appointments.findIndex(apt => apt.appointment_id === appointment.appointment_id);
      if (index !== -1) {
        this.appointments[index] = updatedAppointment;
        this.applyFilters();
        await this.calculateStats();
        this.showSuccess('Appointment approved successfully');
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      this.showError('Failed to approve appointment');
    } finally {
      this.isLoading = false;
    }
  }

  async updateAppointmentStatus(appointment: Appointment, event: any) {
    const newStatus = event.target.value;
    if (!newStatus) return;
    try {
      this.isLoading = true;

      const updatedAppointment = {
        ...appointment,
        appointment_status: newStatus as any,
        updated_at: new Date().toISOString()
      };

      const index = this.appointments.findIndex(apt => apt.appointment_id === appointment.appointment_id);
      if (index !== -1) {
        this.appointments[index] = updatedAppointment;
        this.applyFilters();
        await this.calculateStats();
        this.showSuccess('Appointment status updated successfully');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      this.showError('Failed to update appointment status');
    } finally {
      this.isLoading = false;
    }
  }

  // Utility methods
  validateAppointmentForm(): boolean {
    if (!this.newAppointment.patient_id) {
      this.showError('Please select a patient');
      return false;
    }
    if (!this.newAppointment.doctor_id) {
      this.showError('Please select a doctor');
      return false;
    }
    if (!this.newAppointment.appointment_date) {
      this.showError('Please select an appointment date');
      return false;
    }
    if (!this.newAppointment.appointment_time) {
      this.showError('Please select an appointment time');
      return false;
    }
    return true;
  }

  getStatusBadgeClass(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  }

  getVisitTypeBadgeClass(visitType: string): string {
    const visitTypeOption = this.visitTypes.find(vt => vt.value === visitType);
    return visitTypeOption ? visitTypeOption.color : 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isPast(dateString: string, timeString: string): boolean {
    const appointmentDateTime = new Date(`${dateString}T${timeString}`);
    return appointmentDateTime < new Date();
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
