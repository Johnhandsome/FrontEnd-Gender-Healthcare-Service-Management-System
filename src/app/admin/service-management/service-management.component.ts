import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceSearchBarComponent } from './service-search-bar/service-search-bar.component';
import { ServiceTableComponent } from './service-table/service-table.component';
import { Service } from '../../models/service.interface';
import { HeaderComponent } from "../header/header.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CategoryService } from '../../Services/category.service';
import { ServiceManagementService } from '../../Services/service-management.service';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceSearchBarComponent, ServiceTableComponent, HeaderComponent, SidebarComponent],
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.css']
})
export class ServiceManagementComponent implements OnInit {
  services: Service[] = [];
  categories: Category[] = [];
  filteredServices: Service[] = [];
  isLoading = false;
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  descriptionKeys: DescriptionKey[] = ['what', 'why', 'who', 'how'];
  newService: Service = {
    service_id: '',
    category_id: '',
    service_name: '',
    service_description: null,
    service_cost: null,
    duration_minutes: null,
    is_active: true,
    image_link: null,
    excerpt: null
  };
  selectedService: Service = { ...this.newService };
  newServiceDescription: { [key in DescriptionKey]: string } = {
    what: '',
    why: '',
    who: '',
    how: ''
  };
  selectedServiceDescription: { [key in DescriptionKey]: string } = {
    what: '',
    why: '',
    who: '',
    how: ''
  };
  errors: {
    service_name: boolean;
    category_id: boolean;
    service_cost: boolean;
    duration_minutes: boolean;
  } = {
    service_name: false,
    category_id: false,
    service_cost: false,
    duration_minutes: false
  };
  currentPage: number = 1;
  readonly pageSize: number = 10;

  constructor(
    private serviceManagementService: ServiceManagementService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      const [services, categories] = await Promise.all([
        this.serviceManagementService.getMedicalServices(),
        this.categoryService.getServiceCategories()
      ]);
      this.services = services;
      this.categories = categories;
      this.filteredServices = [...this.services];
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get paginatedServices(): Service[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredServices.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredServices.length / this.pageSize);
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

  applyFilters(filters: { searchTerm: string; selectedCategory: string; selectedStatus: string }) {
    this.filteredServices = this.services.filter(sv =>
      (!filters.searchTerm || sv.service_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
      (!filters.selectedCategory || sv.category_id === filters.selectedCategory) &&
      (!filters.selectedStatus || sv.is_active.toString() === filters.selectedStatus)
    );
    this.currentPage = 1; // Reset to first page on filter change
  }

  hasErrors(): boolean {
    return Object.values(this.errors).some(error => error) ||
      !this.newService.service_name ||
      !this.newService.category_id ||
      (this.newService.service_cost != null && this.newService.service_cost < 0) ||
      (this.newService.duration_minutes != null && (this.newService.duration_minutes <= 0 || this.newService.duration_minutes > 60));
  }

  openAddServiceModal() {
    this.newService = {
      service_id: '',
      category_id: '',
      service_name: '',
      service_description: null,
      service_cost: null,
      duration_minutes: null,
      is_active: true,
      image_link: null,
      excerpt: null
    };
    this.newServiceDescription = {
      what: '',
      why: '',
      who: '',
      how: ''
    };
    this.errors = {
      service_name: false,
      category_id: false,
      service_cost: false,
      duration_minutes: false
    };
    this.showAddModal = true;
  }

  closeAddServiceModal() {
    this.showAddModal = false;
    this.errors = {
      service_name: false,
      category_id: false,
      service_cost: false,
      duration_minutes: false
    };
  }

  async addService() {
    this.errors = {
      service_name: !this.newService.service_name,
      category_id: !this.newService.category_id,
      service_cost: this.newService.service_cost != null && this.newService.service_cost < 0,
      duration_minutes: this.newService.duration_minutes != null && (this.newService.duration_minutes <= 0 || this.newService.duration_minutes > 60)
    };

    if (this.hasErrors()) {
      return;
    }

    try {
      this.isLoading = true;
      const serviceToAdd: Service = {
        ...this.newService,
        service_description: this.descriptionKeys.reduce((acc, key) => {
          acc[key] = this.newServiceDescription[key] || null;
          return acc;
        }, {} as { [key in DescriptionKey]: string | null })
      };
      await this.serviceManagementService.addMedicalService(serviceToAdd);
      this.services = await this.serviceManagementService.getMedicalServices();
      this.filteredServices = [...this.services];
      this.currentPage = 1; // Reset to first page after adding
      this.closeAddServiceModal();
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    } finally {
      this.isLoading = false;
    }
  }

  openEditServiceModal(service: Service) {
    this.selectedService = { ...service };
    this.selectedServiceDescription = {
      what: service.service_description?.what || '',
      why: service.service_description?.why || '',
      who: service.service_description?.who || '',
      how: service.service_description?.how || ''
    };
    this.errors = {
      service_name: false,
      category_id: false,
      service_cost: false,
      duration_minutes: false
    };
    this.showEditModal = true;
  }

  closeEditServiceModal() {
    this.showEditModal = false;
    this.errors = {
      service_name: false,
      category_id: false,
      service_cost: false,
      duration_minutes: false
    };
  }

  async updateService() {
    this.errors = {
      service_name: !this.selectedService.service_name,
      category_id: !this.selectedService.category_id,
      service_cost: this.selectedService.service_cost != null && this.selectedService.service_cost < 0,
      duration_minutes: this.selectedService.duration_minutes != null && (this.selectedService.duration_minutes <= 0 || this.selectedService.duration_minutes > 60)
    };

    if (this.hasErrors()) {
      return;
    }

    try {
      this.isLoading = true;
      const serviceToUpdate: Service = {
        ...this.selectedService,
        service_description: this.descriptionKeys.reduce((acc, key) => {
          acc[key] = this.selectedServiceDescription[key] || null;
          return acc;
        }, {} as { [key in DescriptionKey]: string | null })
      };
      await this.serviceManagementService.updateMedicalService(serviceToUpdate);
      this.services = await this.serviceManagementService.getMedicalServices();
      this.filteredServices = [...this.services];
      this.currentPage = 1; // Reset to first page after updating
      this.closeEditServiceModal();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service');
    } finally {
      this.isLoading = false;
    }
  }

  openViewServiceModal(service: Service) {
    this.selectedService = { ...service };
    this.showViewModal = true;
  }

  closeViewServiceModal() {
    this.showViewModal = false;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.category_id === categoryId);
    return category ? category.category_name : 'Unknown';
  }
}

type DescriptionKey = 'what' | 'why' | 'who' | 'how';
