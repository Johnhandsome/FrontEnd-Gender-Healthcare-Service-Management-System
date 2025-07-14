import { Staff, Role } from '../../models/staff.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';
import { StaffSearchBarComponent } from './staff-search-bar/staff-search-bar.component';
import { StaffTableComponent } from './staff-table/staff-table.component';
import { v4 as uuidv4 } from 'uuid';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-staff-management',
  imports: [CommonModule, FormsModule, StaffSearchBarComponent, StaffTableComponent, SidebarComponent, HeaderComponent],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.css'],
  standalone: true
})
export class StaffManagementComponent implements OnInit {
  staffMembers: Staff[] = [];
  roles: Role[] = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'receptionist', label: 'Receptionist' }
  ];
  filteredStaff: Staff[] = [];
  isLoading = false;
  page: number = 1;
  pageSize: number = 10;
  selectedStaff: Staff | null = null;
  showViewModal = false;
  showEditModal = false;
  showAddModal = false;
  editForm: Staff = {
    staff_id: '',
    full_name: '',
    working_email: '',
    role: '',
    years_experience: 0,
    hired_at: '',
    is_available: false,
    staff_status: '',
    created_at: '',
    updated_at: '',
    image_link: '',
    gender: '',
    languages: []
  };
  addForm: Staff = {
    staff_id: '',
    full_name: '',
    working_email: '',
    role: '',
    years_experience: 0,
    hired_at: new Date().toISOString().split('T')[0],
    is_available: true,
    staff_status: 'active',
    created_at: '',
    updated_at: '',
    image_link: '',
    gender: '',
    languages: []
  };
  languagesInput: string = '';
  addLanguagesInput: string = '';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.staffMembers = await this.supabaseService.getStaffMembers();
      this.filteredStaff = [...this.staffMembers];
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(filters: { searchTerm: string; selectedRole: string; selectedStatus: string }) {
    this.page = 1;
    this.filteredStaff = this.staffMembers.filter(staff =>
      (!filters.searchTerm || staff.full_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
      (!filters.selectedRole || staff.role === filters.selectedRole) &&
      (!filters.selectedStatus || staff.staff_status === filters.selectedStatus)
    );
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.page = event.page;
    this.pageSize = event.pageSize;
  }

  onViewStaff(staff: Staff) {
    this.selectedStaff = { ...staff };
    this.showViewModal = true;
  }

  onEditStaff(staff: Staff) {
    this.selectedStaff = { ...staff };
    this.editForm = {
      ...staff,
      created_at: staff.created_at || '',
      updated_at: staff.updated_at || '',
      image_link: staff.image_link || '',
      gender: staff.gender || '',
      languages: staff.languages || []
    };
    this.languagesInput = staff.languages?.join(', ') || '';
    this.showEditModal = true;
  }

  onAddStaff() {
    this.resetAddForm();
    this.showAddModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedStaff = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedStaff = null;
    this.resetEditForm();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetAddForm();
  }

  async onSubmitEdit() {
    if (!this.selectedStaff) return;

    this.isLoading = true;
    try {
      const updatedStaff: Staff = {
        ...this.editForm,
        // Preserve original role, years_experience, and hired_at
        role: this.selectedStaff.role,
        years_experience: this.selectedStaff.years_experience,
        hired_at: this.selectedStaff.hired_at,
        languages: this.languagesInput ? this.languagesInput.split(',').map(lang => lang.trim()).filter(lang => lang) : []
      };
      await this.supabaseService.updateStaffMember(updatedStaff.staff_id, updatedStaff);
      const index = this.staffMembers.findIndex(s => s.staff_id === updatedStaff.staff_id);
      if (index !== -1) {
        this.staffMembers[index] = updatedStaff;
        this.filteredStaff = [...this.staffMembers];
        this.applyFilters({ searchTerm: '', selectedRole: '', selectedStatus: '' });
      }
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating staff:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmitAdd() {
    this.isLoading = true;
    try {
      const newStaff: Staff = {
        ...this.addForm,
        staff_id: uuidv4(),
        languages: this.addLanguagesInput ? this.addLanguagesInput.split(',').map(lang => lang.trim()).filter(lang => lang) : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await this.supabaseService.addStaffMember(newStaff);
      this.staffMembers.push(newStaff);
      this.filteredStaff = [...this.staffMembers];
      this.applyFilters({ searchTerm: '', selectedRole: '', selectedStatus: '' });
      this.closeAddModal();
    } catch (error) {
      console.error('Error adding staff:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getRoleName(roleValue: string): string {
    const role = this.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  }

  formatDate(date: string | undefined): string {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }

  formatDateForInput(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private resetEditForm() {
    this.editForm = {
      staff_id: '',
      full_name: '',
      working_email: '',
      role: '',
      years_experience: 0,
      hired_at: '',
      is_available: false,
      staff_status: '',
      created_at: '',
      updated_at: '',
      image_link: '',
      gender: '',
      languages: []
    };
    this.languagesInput = '';
  }

  private resetAddForm() {
    this.addForm = {
      staff_id: '',
      full_name: '',
      working_email: '',
      role: '',
      years_experience: 0,
      hired_at: new Date().toISOString().split('T')[0],
      is_available: true,
      staff_status: 'active',
      created_at: '',
      updated_at: '',
      image_link: '',
      gender: '',
      languages: []
    };
    this.addLanguagesInput = '';
  }
}
