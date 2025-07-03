import { NgClass } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { TokenService } from '../../Services/token.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isSearch = false;
  isActive = false;
  isMenuOpen = false;
  isUserMenuOpen = false;

  // Trong component .ts (Angular)
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10; // chỉnh số px nếu muốn
  }

  private userService = inject(UserService);
  private router = inject(Router);
  user: any = null;

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        this.user = null;
      },
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.user = null;
    this.router.navigate(['/login']);
  }

  isSearchHandle(val: boolean) {
    this.isSearch = val;
  }
  closeSearch() {
    this.isSearch = false;
  }
  openMenu() {
    this.isMenuOpen = true;
  }
  closeMenu() {
    this.isMenuOpen = false;
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleHamburger() {
    this.isActive = !this.isActive;
  }
}
