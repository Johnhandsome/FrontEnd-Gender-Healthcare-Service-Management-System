import { Routes } from '@angular/router';

// Customer-facing components
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AppointmentPageComponent } from './pages/appointment-page/appointment-page.component';
import { DoctorsPageComponent } from './pages/doctors-page/doctors-page.component';
import { BlogsPageComponent } from './pages/blogs-page/blogs-page.component';
import { DoctorDetailComponent } from './pages/doctor-detail/doctor-detail.component';
import { BlogDetailComponent } from './pages/blog-detail/blog-detail.component';
import { ForgotPasswordComponent } from './pages/forget-password/forget-password.component';
import { ServicePageComponent } from './pages/services-page/services-page.component';

// Admin components
import { PatientManagementComponent } from './admin/patient-management/patient-management.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { StaffManagementComponent } from './admin/staff-management/staff-management.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { ServiceManagementComponent } from './admin/service-management/service-management.component';
import { AnalyticManagementComponent } from './admin/analytic-management/analytic-management.component';

// Doctor components
import { DoctorDashboardComponent } from './doctor/doctor-dashboard/doctor-dashboard.component';

export const routes: Routes = [
  // Customer-facing routes (public website)
  { path: '', component: HomePageComponent, data: { breadcrumb: 'Home' } },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'appointment', component: AppointmentPageComponent, data: { breadcrumb: 'Appointment' } },
  { path: 'doctors', component: DoctorsPageComponent, data: { breadcrumb: 'Doctors' } },
  { path: 'doctors/:id', component: DoctorDetailComponent, data: { breadcrumb: '...' } },
  { path: 'blog', component: BlogsPageComponent, data: { breadcrumb: 'Blogs' } },
  { path: 'blog/:id', component: BlogDetailComponent, data: { breadcrumb: '...' } },
  { path: 'services', component: ServicePageComponent, data: { breadcrumb: 'Services' } },

  // Admin routes (management system)
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/analytic', component: AnalyticManagementComponent },
  { path: 'admin/patient', component: PatientManagementComponent },
  { path: 'admin/staff', component: StaffManagementComponent },
  { path: 'admin/appointment', component: AppointmentManagementComponent },
  { path: 'admin/services', component: ServiceManagementComponent },

  // Doctor routes (doctor portal)
  { path: 'doctor/dashboard', component: DoctorDashboardComponent },

  // Redirects for compatibility
  { path: 'doctor', redirectTo: '/doctors', pathMatch: 'full' }, // Redirect old doctor route to customer-facing doctors
  { path: 'service', redirectTo: '/services', pathMatch: 'full' }, // Redirect old service route to customer-facing services

  // Default redirect - go to customer home page instead of admin
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];


