import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DoctorAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('role');
    const doctorId = localStorage.getItem('doctor_id') || localStorage.getItem('staff_id');

    console.log('🛡️ DoctorAuthGuard checking:', {
      role,
      doctorId,
      hasRole: !!role,
      hasDoctorId: !!doctorId,
      roleIsDoctor: role === 'doctor'
    });

    if (role === 'doctor' && doctorId) {
      console.log('✅ DoctorAuthGuard: Access granted');
      return true;
    }

    console.log('❌ DoctorAuthGuard: Access denied, redirecting to login');
    // Redirect to doctor login if not authenticated
    this.router.navigate(['/doctor/login']);
    return false;
  }
}
