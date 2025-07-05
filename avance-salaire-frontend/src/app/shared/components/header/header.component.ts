import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  menuOpen = false;
  activeDropdown: string | null = null;
  userMenuOpen = false;
  showUserText = false;
  isFixed = false;
  lastScrollTop = 0;

  constructor(private router: Router) {}

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add fixed class when scrolling down
    if (currentScrollTop > 100) {
      this.isFixed = true;
    } else {
      this.isFixed = false;
    }

    // Save current scroll position
    this.lastScrollTop = currentScrollTop;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openDropdown(dropdown: string) {
    this.activeDropdown = dropdown;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}