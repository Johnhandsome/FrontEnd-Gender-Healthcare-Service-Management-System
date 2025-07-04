import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
// Temporarily commented out until dependencies are properly installed
// import Splide from '@splidejs/splide';
import { Doctor } from '../../models/doctor.model';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-splide',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './splide.component.html',
  styleUrls: ['./splide.component.css']
})
export class SplideComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('splideRef') splideRef!: ElementRef;

  // State
  doctors: Doctor[] = [];
  loading = false;
  splide: any;

  // Fallback image
  fallbackImage = 'https://via.placeholder.com/300x400?text=No+Image';

  private userService = inject(UserService);

  ngOnInit(): void {
    this.fetchDoctors();
  }

  ngAfterViewInit(): void {
    // Initialize Splide only after doctors are loaded
    if (this.doctors.length > 0) {
      this.initializeSplide();
    }
  }

  ngOnDestroy(): void {
    if (this.splide) {
      this.splide.destroy();
    }
  }

  /**
   * Fetch doctors data from service
   */
  fetchDoctors(): void {
    this.loading = true;

    // Fetch featured doctors (you can modify the parameters as needed)
    this.userService.getDoctors('', '', '').subscribe({
      next: (data) => {
        // Limit to first 8 doctors for homepage display
        this.doctors = data.slice(0, 8);

        // Initialize splide after data is loaded
        setTimeout(() => {
          if (this.splideRef && this.doctors.length > 0) {
            this.initializeSplide();
          }
        }, 100);
      },
      error: (err) => {
        console.error('Failed to load doctors:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Initialize Splide carousel
   */
  initializeSplide(): void {
    if (this.splide) {
      this.splide.destroy();
    }

    // Temporarily commented out until dependencies are properly installed
    /*
    this.splide = new Splide(this.splideRef.nativeElement, {
      type: 'loop',
      perPage: 3,
      perMove: 1,
      gap: '1rem',
      arrows: false, // Using custom arrows
      pagination: false,
      autoplay: true,
      interval: 4000,
      pauseOnHover: true,
      focus: 'center',
      trimSpace: false,
      breakpoints: {
        1024: {
          perPage: 2,
        },
        768: {
          perPage: 1,
          gap: '0.5rem',
        },
      },
    }).mount();
    */
  }

  /**
   * Navigate to previous slide
   */
  prev(): void {
    if (this.splide) {
      this.splide.go('<');
    }
  }

  /**
   * Navigate to next slide
   */
  next(): void {
    if (this.splide) {
      this.splide.go('>');
    }
  }

  /**
   * Get formatted image URL
   * @param link - Image link from API
   * @returns Formatted image URL
   */
  getImageUrl(link: string | null): string {
    if (!link) return this.fallbackImage;
    return link.includes('//doctor')
      ? link.replace('//doctor', '/doctor')
      : link;
  }
}
