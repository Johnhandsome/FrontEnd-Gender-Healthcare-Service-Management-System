import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('role');
    const staffId = localStorage.getItem('staff_id');
    
    if (role === 'admin' || role === 'manager') {
      return true;
    }
    
    // Redirect to admin login if not authenticated
    this.router.navigate(['/admin/login']);
    return false;
  }
}
