import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';
import { Router } from '@angular/router';
import { ProcessStatus, VisitType } from '../../models/appointment.interface';

interface AppointmentDisplay {
  appointment_id: string;
  appointment_date: string;
  appointment_time?: string;
  appointment_status: string;
  visit_type: string;
  schedule: string;
  message?: string;
  phone: string;
  email: string;
  patient_name: string;
  category_name: string;
}

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  appointments: AppointmentDisplay[] = [];
  filteredAppointments: AppointmentDisplay[] = [];
  loading = true;
  error: string | null = null;
  doctorId: string | null = null;

  // Filter properties
  searchTerm = '';
  selectedStatus = '';
  selectedDate = '';
  selectedVisitType = '';

  // Status options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' }
  ];

  // Visit type options
  visitTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine_checkup', label: 'Routine Checkup' }
  ];

  // Modal properties
  showUpdateModal = false;
  selectedAppointment: AppointmentDisplay | null = null;
  updateForm = {
    appointment_status: '',
    message: ''
  };

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
    this.loadAppointments();
  }

  async loadAppointments() {
    try {
      this.loading = true;
      this.error = null;
      this.appointments = await this.supabaseService.getAppointmentsByDoctor(this.doctorId!);
      this.applyFilters();
    } catch (error: any) {
      this.error = error.message || 'Failed to load appointments';
      console.error('Appointments error:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.searchTerm ||
        appointment.patient_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.phone.includes(this.searchTerm) ||
        appointment.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus ||
        appointment.appointment_status === this.selectedStatus;

      const matchesDate = !this.selectedDate ||
        appointment.appointment_date === this.selectedDate;

      const matchesVisitType = !this.selectedVisitType ||
        appointment.visit_type === this.selectedVisitType;

      return matchesSearch && matchesStatus && matchesDate && matchesVisitType;
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
    this.selectedStatus = '';
    this.selectedDate = '';
    this.selectedVisitType = '';
    this.applyFilters();
  }

  openUpdateModal(appointment: AppointmentDisplay) {
    this.selectedAppointment = appointment;
    this.updateForm = {
      appointment_status: appointment.appointment_status,
      message: appointment.message || ''
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
    this.selectedAppointment = null;
    this.updateForm = {
      appointment_status: '',
      message: ''
    };
  }

  async updateAppointment() {
    if (!this.selectedAppointment) return;

    try {
      await this.supabaseService.updateAppointmentStatus({
        appointment_id: this.selectedAppointment.appointment_id,
        appointment_status: this.updateForm.appointment_status as ProcessStatus,
        message: this.updateForm.message
      });

      // Update local data
      const index = this.appointments.findIndex(a => a.appointment_id === this.selectedAppointment!.appointment_id);
      if (index !== -1) {
        this.appointments[index] = {
          ...this.appointments[index],
          appointment_status: this.updateForm.appointment_status,
          message: this.updateForm.message
        };
        this.applyFilters();
      }

      this.closeUpdateModal();
    } catch (error: any) {
      this.error = error.message || 'Failed to update appointment';
      console.error('Update appointment error:', error);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no_show': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
