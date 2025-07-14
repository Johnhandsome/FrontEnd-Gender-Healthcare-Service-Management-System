import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getUserProfile(): Observable<any> {
    return of(null);
  }

  getDoctors(param1: string, param2: string, param3: string): Observable<any> {
    return of([]);
  }

  getBlogs(): Observable<any> {
    return of([]);
  }

  getBlogById(id: string): Observable<any> {
    return of(null);
  }

  getDoctorById(id: string): Observable<any> {
    return of(null);
  }

  forgotPassword(phone: string): Observable<any> {
    return of(null);
  }

  resetPassword(data: any): Observable<any> {
    return of(null);
  }

  login(credentials: any): Observable<any> {
    return of(null);
  }

  register(userData: any): Observable<any> {
    return of(null);
  }

  getServices(): Observable<any> {
    return of([]);
  }

  loginWithPhone(phone: string, password: string): Observable<any> {
    return of(null);
  }

  registerUser(userData: any): Observable<any> {
    return of(null);
  }
}
