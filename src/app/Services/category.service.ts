import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  getCategories(): Observable<any> {
    return of([]);
  }

  getCategoryById(id: string): Observable<any> {
    return of(null);
  }

  createCategory(category: any): Observable<any> {
    return of(null);
  }

  updateCategory(id: string, category: any): Observable<any> {
    return of(null);
  }

  deleteCategory(id: string): Observable<any> {
    return of(null);
  }

  getServiceCategories(): Promise<any> {
    return Promise.resolve([]);
  }
}
