import { Component, signal, inject, OnInit } from '@angular/core';

import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { UserService } from '../../Services/user.service';
import { MedicalService } from '../../models/service.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NgClass, RouterLink],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.css',
})
export class ServicePageComponent implements OnInit {
  private userService = inject(UserService);

  categories = signal<string[]>(['All']);
  services = signal<MedicalService[]>([]);
  searchValue = signal('');
  selectedCategory = signal('All');
  page = signal(1);
  pageSize = 6;
  loading = signal(true);
  skeletons = Array.from({ length: this.pageSize }, (_, i) => i);

  ngOnInit() {
    this.loading.set(true);
    this.userService.getServices().subscribe({
      next: (data) => {
        this.services.set(data || []);
        const uniqueCats = Array.from(
          new Set(
            (data || [])
              .map((s) => s.service_categories?.category_name)
              .filter(Boolean)
          )
        );
        this.categories.set(['All', ...uniqueCats]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  limitText(text: string | null, maxLength: number = 32): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  formatPrice(price: number): string {
    return typeof price === 'number'
      ? price.toLocaleString('en-US') + ' VND'
      : price + ' VND';
  }

  get filteredServices(): MedicalService[] {
    let filtered = this.services();
    if (this.selectedCategory() !== 'All') {
      filtered = filtered.filter(
        (s) => s.service_categories?.category_name === this.selectedCategory()
      );
    }
    const searchLower = this.searchValue().toLowerCase();
    if (searchLower) {
      filtered = filtered.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(searchLower)) ||
          (s.excerpt && s.excerpt.toLowerCase().includes(searchLower)) ||
          (typeof s.price === 'number' &&
            this.formatPrice(s.price).toLowerCase().includes(searchLower))
      );
    }
    return filtered;
  }

  get paginatedServices(): MedicalService[] {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredServices.slice(start, start + this.pageSize);
  }

  get maxPage(): number {
    return Math.ceil(this.filteredServices.length / this.pageSize) || 1;
  }

  get pageArray(): number[] {
    return Array(this.maxPage)
      .fill(0)
      .map((_, i) => i + 1);
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchValue.set(target.value);
    this.page.set(1);
  }

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.page.set(1);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.maxPage) {
      this.page.set(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  bookService(service: MedicalService, event: Event) {
    event.preventDefault();
    const message = `I want to ask about ${service.name}`;
    localStorage.setItem('Remember-contact-form', JSON.stringify({ message }));
  }
}
