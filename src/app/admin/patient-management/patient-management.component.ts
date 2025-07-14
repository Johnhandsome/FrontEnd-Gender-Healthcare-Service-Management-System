import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';
import { PatientSearchBarComponent } from './patient-search-bar/patient-search-bar.component';
import { PatientTableComponent } from './patient-table/patient-table.component';
import { Patient } from '../../models/patient.interface';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientSearchBarComponent, PatientTableComponent],
  templateUrl: './patient-management.component.html',
  styleUrls: ['./patient-management.component.css']
})
export class PatientManagementComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  isLoading = false;
  currentPage: number = 1;
  readonly pageSize: number = 10;
  showAddModal = false;
  showViewModal = false;
  showEditModal = false;
  selectedPatient: Patient | null = null;
  newPatient: Partial<Patient> = {
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    patient_status: 'active',
    vaccination_status: 'not_vaccinated'
  };
  allergiesJson: string = '';
  chronicConditionsJson: string = '';
  pastSurgeriesJson: string = '';

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const result = await this.supabaseService.getPatients(1, 1000);
      this.patients = result.patients || [];
      this.filteredPatients = [...this.patients];
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get paginatedPatients(): Patient[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPatients.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPatients.length / this.pageSize);
  }

  goToFirstPage() {
    this.currentPage = 1;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
  }

  applyFilters(filters: { query: string; gender: string; status: string }) {
    this.filteredPatients = this.patients.filter(patient =>
      (!filters.query || patient.full_name.toLowerCase().includes(filters.query.toLowerCase())) &&
      (!filters.gender || patient.gender === filters.gender) &&
      (!filters.status || patient.patient_status === filters.status)
    );
    this.currentPage = 1;
  }

  openAddPatientModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newPatient = {
      full_name: '',
      phone: '',
      email: '',
      gender: '',
      patient_status: 'active',
      vaccination_status: 'not_vaccinated'
    };
  }

  openViewPatientModal(patient: Patient) {
    this.selectedPatient = { ...patient };
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedPatient = null;
  }

  openEditPatientModal(patient: Patient) {
    this.selectedPatient = { ...patient };
    this.allergiesJson = this.stringifyJson(patient.allergies);
    this.chronicConditionsJson = this.stringifyJson(patient.chronic_conditions);
    this.pastSurgeriesJson = this.stringifyJson(patient.past_surgeries);
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedPatient = null;
  }

  async updatePatient() {
    if (!this.selectedPatient) return;
    try {
      await this.supabaseService.updatePatient(this.selectedPatient.id, this.selectedPatient);
      const result = await this.supabaseService.getPatients(1, 1000);
      this.patients = result.patients || [];
      this.filteredPatients = [...this.patients];
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  }

  isObject(value: any): value is Record<string, string> {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  objectKeys(obj: Record<string, string>): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatJsonField(value: Record<string, string> | string[] | null): string {
    if (!value) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    return JSON.stringify(value);
  }

  stringifyJson(value: Record<string, string> | string[] | null): string {
    return value ? JSON.stringify(value, null, 2) : '';
  }

  parseJson(value: string, field: keyof Patient) {
  if (!this.selectedPatient) return;

  // Type guard để kiểm tra field có phải là JSON field không
  const jsonFields: (keyof Patient)[] = ['allergies', 'chronic_conditions', 'past_surgeries'];

  if (!jsonFields.includes(field)) {
    console.warn(`Field ${field} is not a JSON field`);
    return;
  }

  try {
    const parsed = value ? JSON.parse(value) : null;
    if (parsed === null || Array.isArray(parsed) || this.isObject(parsed)) {
      // Type assertion với any để bypass type checking
      (this.selectedPatient as any)[field] = parsed as Record<string, string> | string[] | null;
    }
  } catch {
    console.warn(`Invalid JSON for ${field}: ${value}`);
    (this.selectedPatient as any)[field] = null;
  }
}
}
