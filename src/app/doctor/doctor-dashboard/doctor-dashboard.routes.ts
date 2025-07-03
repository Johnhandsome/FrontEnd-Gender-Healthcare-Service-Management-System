import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AppointmentsComponent } from '../appointments/appointments.component';
import { PatientsComponent } from '../patients/patients.component';
import { ReceiptsComponent } from '../receipts/receipts.component';
import { ScheduleComponent } from '../schedule/schedule.component';
import { ServicesComponent } from '../services/services.component';
import { BlogPostsComponent } from '../blog-posts/blog-posts.component';
import { ProfileComponent } from '../profile/profile.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { ActivityLogsComponent } from '../activity-logs/activity-logs.component';

export const doctorDashboardRoutes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'receipts', component: ReceiptsComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'blog-posts', component: BlogPostsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'activity-logs', component: ActivityLogsComponent }
];
