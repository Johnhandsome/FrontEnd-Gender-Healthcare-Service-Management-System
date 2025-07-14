import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private labelSubject = new BehaviorSubject<any>({});
  public label$ = this.labelSubject.asObservable();

  setLabel(path: string, label: string): void {
    const currentLabels = this.labelSubject.value;
    this.labelSubject.next({ ...currentLabels, [path]: label });
  }

  clearLabel(path: string): void {
    const currentLabels = this.labelSubject.value;
    delete currentLabels[path];
    this.labelSubject.next({ ...currentLabels });
  }
}
