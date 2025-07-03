import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Doctor } from '../../models/doctor.model';
import { UserService } from '../../Services/user.service';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NgClass, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-doctors-page',
  standalone: true,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    NgClass,
    FormsModule,
    TitleCasePipe,
    BreadcrumbsComponent,
  ],
  templateUrl: './doctors-page.component.html',
  styleUrls: ['./doctors-page.component.css'],
})
export class DoctorsPageComponent implements OnInit {
  allDoctors: Doctor[] = [];
  paginatedDoctors: Doctor[] = [];
  loading = false;

  // Filter state
  searchValue: string = '';
  selectedSpecialty: string = 'All';
  selectedGender: string = 'All';
  specialties: string[] = ['All'];
  genders: string[] = ['All', 'male', 'female', 'other'];

  // Pagination state
  page = 1;
  perPage = 6;
  maxPage = 1;

  showFilter = false;
  isDesktop: boolean = window.innerWidth >= 768;

  private userService = inject(UserService);

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.loading = true;
    this.userService.getDoctors('', '', '').subscribe({
      next: (data) => {
        this.allDoctors = data;
        // get unique specialties
        const uniqueSpecialties = Array.from(
          new Set(data.map((doc) => doc.speciality).filter(Boolean))
        );
        this.specialties = ['All', ...uniqueSpecialties];
        this.page = 1;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        alert('Không thể tải danh sách bác sĩ');
        this.loading = false;
      },
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isDesktop = window.innerWidth >= 768;
  }

  fallbackImage = 'https://via.placeholder.com/300x400?text=No+Image';
  getImageUrl(link: string | null | undefined): string {
    if (!link) return this.fallbackImage;
    return link.includes('//doctor')
      ? link.replace('//doctor', '/doctor')
      : link;
  }

  // FILTER HANDLERS
  onSearch(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value.trim();
    this.page = 1;
    this.updatePagination();
  }

  selectSpecialty(specialty: string): void {
    this.selectedSpecialty = specialty;
    this.page = 1;
    this.updatePagination();
  }

  selectGender(gender: string): void {
    this.selectedGender = gender;
    this.page = 1;
    this.updatePagination();
  }

  // FILTER + PAGINATION
  updatePagination(): void {
    let filtered = this.allDoctors;

    // Filter by specialty
    if (this.selectedSpecialty !== 'All')
      filtered = filtered.filter(
        (doc) => doc.speciality === this.selectedSpecialty
      );

    // Filter by gender
    if (this.selectedGender !== 'All')
      filtered = filtered.filter(
        (doc) => doc.staff_members?.gender === this.selectedGender
      );

    // Filter by search name
    if (this.searchValue)
      filtered = filtered.filter((doc) =>
        doc.staff_members?.full_name
          ?.toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );

    this.maxPage = Math.max(1, Math.ceil(filtered.length / this.perPage));
    const start = (this.page - 1) * this.perPage;
    this.paginatedDoctors = filtered.slice(start, start + this.perPage);
  }

  goToPage(pg: number): void {
    if (pg < 1 || pg > this.maxPage) return;
    this.page = pg;
    this.updatePagination();
  }

  get pageArray(): number[] {
    return Array.from({ length: this.maxPage }, (_, i) => i);
  }
}
