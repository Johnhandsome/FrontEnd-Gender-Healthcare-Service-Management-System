import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceManagementService {

  getServices(): Observable<any> {
    return of([]);
  }

  getServiceById(id: string): Observable<any> {
    return of(null);
  }

  createService(service: any): Observable<any> {
    return of(null);
  }

  updateService(id: string, service: any): Observable<any> {
    return of(null);
  }

  deleteService(id: string): Observable<any> {
    return of(null);
  }

  getMedicalServices(): Promise<any> {
    return Promise.resolve([]);
  }

  addMedicalService(service: any): Promise<any> {
    return Promise.resolve(null);
  }

  updateMedicalService(service: any): Promise<any> {
    return Promise.resolve(null);
  }
}
