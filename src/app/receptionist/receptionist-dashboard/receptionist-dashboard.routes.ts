import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AppointmentsComponent } from '../appointments/appointments.component';
import { PatientRegistrationComponent } from '../patient-registration/patient-registration.component';
import { PatientRecordsComponent } from '../patient-records/patient-records.component';
import { DoctorScheduleComponent } from '../doctor-schedule/doctor-schedule.component';
import { ReceptionTasksComponent } from '../reception-tasks/reception-tasks.component';
import { ReportsComponent } from '../reports/reports.component';
import { ReceptionistAuthGuard } from '../receptionist-auth.guard';

export const receptionistDashboardRoutes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [ReceptionistAuthGuard] },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [ReceptionistAuthGuard] },
  { path: 'patient-registration', component: PatientRegistrationComponent, canActivate: [ReceptionistAuthGuard] },
  { path: 'patient-records', component: PatientRecordsComponent, canActivate: [ReceptionistAuthGuard] },
  { path: 'doctor-schedule', component: DoctorScheduleComponent, canActivate: [ReceptionistAuthGuard] },
  { path: 'reception-tasks', component: ReceptionTasksComponent, canActivate: [ReceptionistAuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [ReceptionistAuthGuard] }
];
