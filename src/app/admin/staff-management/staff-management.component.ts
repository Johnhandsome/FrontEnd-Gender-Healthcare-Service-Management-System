import { Staff, Role, CreateStaffRequest, CreateStaffResponse } from '../../models/staff.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-staff-management',
  imports: [CommonModule, FormsModule],
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

  // Image upload properties
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageUploadError: string | null = null;

  // Form validation and feedback
  formErrors: { [key: string]: string } = {};
  isSubmitting = false;
  submitSuccess: string | null = null;
  submitError: string | null = null;

  // Filter properties
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  selectedAvailability: string = '';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadStaff();
  }

  async loadStaff() {
    this.isLoading = true;
    try {
      const result = await this.supabaseService.getAllStaff();
      if (result.success && result.data) {
        this.staffMembers = result.data;
        this.filteredStaff = [...this.staffMembers];
      } else {
        console.error('Error fetching staff:', result.error);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(filters: { searchTerm: string; selectedRole: string; selectedStatus: string; selectedAvailability?: string }) {
    this.page = 1;
    this.filteredStaff = this.staffMembers.filter(staff => {
      const matchesSearch = !filters.searchTerm ||
        staff.full_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        staff.working_email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesRole = !filters.selectedRole || staff.role === filters.selectedRole;
      const matchesStatus = !filters.selectedStatus || staff.staff_status === filters.selectedStatus;
      const matchesAvailability = !filters.selectedAvailability ||
        staff.is_available.toString() === filters.selectedAvailability;

      return matchesSearch && matchesRole && matchesStatus && matchesAvailability;
    });
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
    this.clearImageUpload();
    this.clearFormErrors();
  }

  async onSubmitEdit() {
    if (!this.selectedStaff) return;

    this.isLoading = true;
    try {
      const updateData: Partial<Staff> = {
        full_name: this.editForm.full_name,
        working_email: this.editForm.working_email,
        is_available: this.editForm.is_available,
        staff_status: this.editForm.staff_status,
        gender: this.editForm.gender,
        image_link: this.editForm.image_link,
        languages: this.languagesInput ? this.languagesInput.split(',').map(lang => lang.trim()).filter(lang => lang) : []
      };

      const result = await this.supabaseService.updateStaffMember(this.editForm.staff_id, updateData);

      if (result.success && result.data) {
        await this.loadStaff();
        this.closeEditModal();
        console.log('Staff member updated successfully');
      } else {
        console.error('Error updating staff:', result.error);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmitAdd() {
    // Clear previous errors and messages
    this.clearFormErrors();
    this.submitError = null;
    this.submitSuccess = null;

    // Validate form
    if (!this.validateAddForm()) {
      return;
    }

    this.isSubmitting = true;
    try {
      const staffData: CreateStaffRequest = {
        full_name: this.addForm.full_name,
        working_email: this.addForm.working_email,
        role: this.addForm.role,
        years_experience: this.addForm.years_experience,
        hired_at: this.addForm.hired_at,
        is_available: this.addForm.is_available,
        staff_status: this.addForm.staff_status,
        gender: this.addForm.gender,
        languages: this.addLanguagesInput ? this.addLanguagesInput.split(',').map(lang => lang.trim()).filter(lang => lang) : [],
        phone: this.addForm.phone,
        imageFile: this.selectedImageFile || undefined
      };

      const result: CreateStaffResponse = await this.supabaseService.createStaffWithEdgeFunction(staffData);

      if (result.success && result.data) {
        this.submitSuccess = 'Staff member created successfully!';
        await this.loadStaff();

        // Close modal after showing success message
        setTimeout(() => {
          this.closeAddModal();
        }, 1500);
      } else {
        this.submitError = result.error?.message || 'Failed to create staff member';
        console.error('Error adding staff:', result.error);
      }
    } catch (error: any) {
      this.submitError = error.message || 'An unexpected error occurred';
      console.error('Error adding staff:', error);
    } finally {
      this.isSubmitting = false;
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

  // Enhanced methods for modern UI
  exportStaff() {
    try {
      const dataToExport = this.filteredStaff.map(staff => ({
        'Staff ID': staff.staff_id,
        'Full Name': staff.full_name,
        'Email': staff.working_email,
        'Role': this.getRoleName(staff.role),
        'Experience (Years)': staff.years_experience || 0,
        'Hired Date': this.formatDate(staff.hired_at),
        'Status': staff.staff_status,
        'Availability': staff.is_available ? 'Available' : 'Unavailable',
        'Gender': staff.gender || 'N/A',
        'Languages': staff.languages?.join(', ') || 'N/A'
      }));

      const csvContent = this.convertToCSV(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting staff data:', error);
    }
  }

  onDeleteStaff(staff: Staff) {
    if (confirm(`Are you sure you want to delete ${staff.full_name}? This action cannot be undone.`)) {
      this.deleteStaff(staff.staff_id);
    }
  }

  onBulkAction(action: { type: string; staffIds: string[] }) {
    switch (action.type) {
      case 'delete':
        if (confirm(`Are you sure you want to delete ${action.staffIds.length} staff members? This action cannot be undone.`)) {
          this.bulkDeleteStaff(action.staffIds);
        }
        break;
      case 'activate':
        this.bulkUpdateStatus(action.staffIds, 'active');
        break;
      case 'deactivate':
        this.bulkUpdateStatus(action.staffIds, 'inactive');
        break;
      default:
        console.warn('Unknown bulk action:', action.type);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private async deleteStaff(staffId: string) {
    try {
      this.isLoading = true;
      const result = await this.supabaseService.deleteStaffMember(staffId);

      if (result.success) {
        await this.loadStaff();
        console.log('Staff member deleted successfully');
      } else {
        console.error('Error deleting staff member:', result.error);
      }
    } catch (error) {
      console.error('Error deleting staff member:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async bulkDeleteStaff(staffIds: string[]) {
    try {
      this.isLoading = true;
      const deletePromises = staffIds.map(id => this.supabaseService.deleteStaffMember(id));
      const results = await Promise.all(deletePromises);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        await this.loadStaff();
        console.log(`${successCount} staff members deleted successfully`);
      }

      if (failCount > 0) {
        console.error(`Failed to delete ${failCount} staff members`);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async bulkUpdateStatus(staffIds: string[], status: string) {
    try {
      this.isLoading = true;
      const updatePromises = staffIds.map(id =>
        this.supabaseService.updateStaffMember(id, { staff_status: status })
      );
      const results = await Promise.all(updatePromises);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        await this.loadStaff();
        console.log(`${successCount} staff members updated successfully`);
      }

      if (failCount > 0) {
        console.error(`Failed to update ${failCount} staff members`);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
    } finally {
      this.isLoading = false;
    }
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

  // Image upload methods
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.imageUploadError = 'Please select a valid image file (JPEG, PNG, or GIF)';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.imageUploadError = 'Image file size must be less than 5MB';
        return;
      }

      this.selectedImageFile = file;
      this.imageUploadError = null;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.imageUploadError = null;

    // Clear the file input
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearImageUpload() {
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.imageUploadError = null;
  }

  // Form validation methods
  validateAddForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Required field validations
    if (!this.addForm.full_name?.trim()) {
      this.formErrors['full_name'] = 'Full name is required';
      isValid = false;
    }

    if (!this.addForm.working_email?.trim()) {
      this.formErrors['working_email'] = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.addForm.working_email)) {
      this.formErrors['working_email'] = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.addForm.role) {
      this.formErrors['role'] = 'Role is required';
      isValid = false;
    }

    if (!this.addForm.hired_at) {
      this.formErrors['hired_at'] = 'Hire date is required';
      isValid = false;
    }

    if (!this.addForm.staff_status) {
      this.formErrors['staff_status'] = 'Staff status is required';
      isValid = false;
    }

    if (!this.addForm.gender) {
      this.formErrors['gender'] = 'Gender is required';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearFormErrors() {
    this.formErrors = {};
    this.submitError = null;
    this.submitSuccess = null;
  }

  hasError(field: string): boolean {
    return !!this.formErrors[field];
  }

  getError(field: string): string {
    return this.formErrors[field] || '';
  }

  // New methods for inline template functionality
  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyInlineFilters();
  }

  onRoleFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedRole = target.value;
    this.applyInlineFilters();
  }

  onStatusFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.applyInlineFilters();
  }



  getPaginatedStaff(): Staff[] {
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredStaff.slice(startIndex, endIndex);
  }

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getStartIndex(): number {
    return (this.page - 1) * this.pageSize;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.pageSize;
    return Math.min(endIndex, this.filteredStaff.length);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredStaff.length / this.pageSize);
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage() {
    if (this.page < this.getTotalPages()) {
      this.page++;
    }
  }

  // Additional methods for enhanced UI
  getActiveStaffCount(): number {
    return this.staffMembers.filter(staff => staff.staff_status === 'active').length;
  }

  onAvailabilityFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedAvailability = target.value;
    this.applyInlineFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedAvailability = '';
    this.page = 1;
    this.filteredStaff = [...this.staffMembers];
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.page;
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...' as any);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...' as any, totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index && typeof page === 'number') as number[];
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.getTotalPages()) {
      this.page = pageNumber;
    }
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.page = 1; // Reset to first page when changing page size
  }

  private applyInlineFilters() {
    this.page = 1;
    this.filteredStaff = this.staffMembers.filter(staff => {
      const matchesSearch = !this.searchTerm ||
        staff.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        staff.working_email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.selectedRole || staff.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || staff.staff_status === this.selectedStatus;
      const matchesAvailability = !this.selectedAvailability ||
        staff.is_available.toString() === this.selectedAvailability;

      return matchesSearch && matchesRole && matchesStatus && matchesAvailability;
    });
  }
}
