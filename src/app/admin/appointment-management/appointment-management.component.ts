import { Guest, Appointment, GuestAppointment, DisplayAppointment } from './../../models/appointment.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';
import { AppointmentSearchBarComponent } from './appointment-search-bar/appointment-search-bar.component';
import { Patient } from '../../models/patient.interface';
import { AppointmentTableComponent } from './appointment-table/appointment-table.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentSearchBarComponent, AppointmentTableComponent, SidebarComponent, HeaderComponent],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.css']
})
export class AppointmentManagementComponent implements OnInit {
  appointments: Appointment[] = [];
  guestAppointments: GuestAppointment[] = [];
  patients: Patient[] = [];
  guests: Guest[] = [];
  filteredAppointments: DisplayAppointment[] = [];
  isLoading = false;
  currentPage: number = 1;
  readonly pageSize: number = 10;

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      // Use SupabaseService methods that actually exist
      const today = new Date().toISOString().split('T')[0];
      const appointments = await this.supabaseService.getTodayAppointments(today);
      const patients = await this.supabaseService.getPatients(1, 1000);
      this.appointments = appointments;
      this.guestAppointments = await this.supabaseService.getGuestAppointments();
      this.patients = patients.patients || [];
      this.guests = await this.supabaseService.getGuests();
      this.filteredAppointments = this.combineAppointments();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  combineAppointments(): DisplayAppointment[] {
    const patientAppointments: DisplayAppointment[] = this.appointments.map(appt => ({
      id: appt.appointment_id,
      type: 'patient' as const,
      name: this.patients.find(p => p.id === appt.patient_id)?.full_name || 'Unknown',
      phone: appt.phone,
      email: appt.email,
      visit_type: appt.visit_type,
      appointment_status: appt.appointment_status,
      created_at: appt.created_at,
      updated_at: appt.updated_at,
      schedule: appt.schedule
    }));

    const guestAppointments: DisplayAppointment[] = this.guestAppointments.map(appt => ({
      id: appt.guest_appointment_id,
      type: 'guest' as const,
      name: 'guest',
      phone: appt.phone,
      email: appt.email,
      visit_type: appt.visit_type,
      appointment_status: appt.appointment_status,
      created_at: appt.created_at,
      updated_at: appt.updated_at,
      schedule: appt.schedule
    }));

    return [...patientAppointments, ...guestAppointments].sort((a, b) =>
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }

  get paginatedAppointments(): DisplayAppointment[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAppointments.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAppointments.length / this.pageSize);
  }

  goToFirstPage() {
    this.currentPage = 1;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
  }

  applyFilters(filters: { searchTerm: string; visitType: string; status: string }) {
    this.filteredAppointments = this.combineAppointments().filter(appt =>
      (!filters.searchTerm || appt.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
      (!filters.visitType || appt.visit_type === filters.visitType) &&
      (!filters.status || appt.appointment_status === filters.status)
    );
    this.currentPage = 1;
  }
}
