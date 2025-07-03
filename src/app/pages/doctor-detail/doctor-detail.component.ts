import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorDetail } from '../../models/doctor.model';
import { UserService } from '../../Services/user.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbService } from '../../Services/Breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    NgClass,
    FormsModule,
    RouterLink,
    DatePipe,
    BreadcrumbsComponent,
  ],
  templateUrl: './doctor-detail.component.html',
  // styleUrl: './doctor-detail.component.css',
})
export class DoctorDetailComponent implements OnInit, OnDestroy {
  doctor = signal<DoctorDetail | null>(null);
  loading = signal(true);
  errorMsg = signal('');
  activeTab = 'about';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private breadcrumbService = inject(BreadcrumbService);

  private doctorId: string | null = null;
  private breadcrumbSub?: Subscription;

  fallbackImage = 'https://via.placeholder.com/300x400?text=No+Image';

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll top khi vào page

    this.doctorId = this.route.snapshot.paramMap.get('id');
    if (!this.doctorId) {
      this.errorMsg.set('Doctor not found');
      this.loading.set(false);
      return;
    }
    this.fetchDoctor(this.doctorId);
  }

  fetchDoctor(doctor_id: string): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.userService.getDoctorById(doctor_id).subscribe({
      next: (doctor) => {
        this.doctor.set(doctor);
        this.loading.set(false);

        // Gắn label dynamic breadcrumb với đường dẫn chính xác
        const breadcrumbPath = `/doctor/${doctor_id}`;
        const label = doctor?.staff_members?.full_name || 'Doctor Detail';
        this.breadcrumbService.setLabel(breadcrumbPath, label);
      },
      error: () => {
        this.errorMsg.set('Failed to load doctor data');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy() {
    // Clear label khi rời trang detail
    if (this.doctorId) {
      const breadcrumbPath = `/doctor/${this.doctorId}`;
      this.breadcrumbService.clearLabel(breadcrumbPath);
    }
    this.breadcrumbSub?.unsubscribe();
  }

  getImageUrl(link?: string | null): string {
    if (!link) return this.fallbackImage;
    return link.includes('//doctor')
      ? link.replace('//doctor', '/doctor')
      : link;
  }

  // --- GETTERS ---
  get doctorName(): string {
    return this.doctor()?.staff_members?.full_name || 'Dr. [unknown]';
  }

  get doctorAvatar(): string {
    const link = this.doctor()?.staff_members?.image_link;
    if (!link) return this.fallbackImage;
    return link.includes('//doctor')
      ? link.replace('//doctor', '/doctor')
      : link;
  }

  get staffLanguages(): string[] {
    return this.doctor()?.staff_members?.languages ?? [];
  }

  get educationDegrees() {
    return this.doctor()?.educations?.degrees ?? [];
  }

  get certificationList() {
    return this.doctor()?.certifications?.certifications ?? [];
  }

  get specialty(): string {
    return this.doctor()?.speciality?.replaceAll('_', ' ') ?? '';
  }

  get licenseNo(): string {
    return this.doctor()?.license_no ?? '';
  }

  get doctorBlogs() {
    return this.doctor()?.blogs ?? [];
  }

  // --- UI/UX Handlers ---
  setTab(tab: string) {
    this.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList() {
    this.router.navigate(['/doctor']);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }
}
