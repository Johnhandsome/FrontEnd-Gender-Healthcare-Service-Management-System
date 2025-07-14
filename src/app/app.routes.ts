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
import { DatabaseInitComponent } from './admin/database-init/database-init.component';
import { DebugSupabaseComponent } from './debug-supabase.component';

// Doctor components
import { DoctorDashboardComponent } from './doctor/doctor-dashboard/doctor-dashboard.component';
import { doctorDashboardRoutes } from './doctor/doctor-dashboard/doctor-dashboard.routes';

// Auth components and guards
import { AdminLoginComponent } from './admin/login/admin-login.component';
import { DoctorLoginComponent } from './doctor/login/doctor-login.component';
import { DemoLoginGuideComponent } from './demo-login-guide/demo-login-guide.component';
import { AdminAuthGuard } from './admin/admin-auth.guard';
import { DoctorAuthGuard } from './doctor/doctor-auth.guard';

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

  // Demo login guide
  { path: 'demo', component: DemoLoginGuideComponent },

  // Debug tools
  { path: 'debug', component: DebugSupabaseComponent },

  // Admin authentication
  { path: 'admin/login', component: AdminLoginComponent },

  // Admin routes (management system) - protected by auth guard
  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/analytic', component: AnalyticManagementComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/patient', component: PatientManagementComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/staff', component: StaffManagementComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/appointment', component: AppointmentManagementComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/services', component: ServiceManagementComponent, canActivate: [AdminAuthGuard] },
  { path: 'admin/database-init', component: DatabaseInitComponent }, // No auth guard for database init

  // Doctor authentication
  { path: 'doctor/login', component: DoctorLoginComponent },

  // Doctor routes (doctor portal) - protected by auth guard
  {
    path: 'doctor/dashboard',
    component: DoctorDashboardComponent,
    canActivate: [DoctorAuthGuard],
    children: doctorDashboardRoutes
  },

  // Redirects for compatibility
  { path: 'doctor', redirectTo: '/doctors', pathMatch: 'full' }, // Redirect old doctor route to customer-facing doctors
  { path: 'service', redirectTo: '/services', pathMatch: 'full' }, // Redirect old service route to customer-facing services
  { path: 'admin', redirectTo: '/admin/login', pathMatch: 'full' }, // Redirect /admin to login

  // Default redirect - go to customer home page instead of admin
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];


