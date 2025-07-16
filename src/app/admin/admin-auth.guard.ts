import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('role');
    const staffId = localStorage.getItem('staff_id');

    if (role === 'admin') {
      return true;
    }

    // Redirect to unified login if not authenticated
    this.router.navigate(['/login']);
    return false;
  }
}
