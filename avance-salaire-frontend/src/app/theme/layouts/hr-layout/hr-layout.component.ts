// Angular import
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Project import

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumb/breadcrumb.component';
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';
import { NotificationTestSenderComponent } from 'src/app/shared/components/notification/notification-test-sender.component';

@Component({
  selector: 'app-hr-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent, NavigationComponent, BreadcrumbComponent, SpinnerComponent, NotificationTestSenderComponent],
  templateUrl: './hr-layout.component.html',
  styleUrls: ['./hr-layout.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HrLayoutComponent {
  // public props
  navCollapsed: boolean;
  navCollapsedMob: boolean;

  // public method
  navMobClick() {
    if (this.navCollapsedMob && !document.querySelector('app-navigation.pc-sidebar')?.classList.contains('mob-open')) {
      this.navCollapsedMob = !this.navCollapsedMob;
      setTimeout(() => {
        this.navCollapsedMob = !this.navCollapsedMob;
      }, 100);
    } else {
      this.navCollapsedMob = !this.navCollapsedMob;
    }
    if (document.querySelector('app-navigation.pc-sidebar')?.classList.contains('navbar-collapsed')) {
      document.querySelector('app-navigation.pc-sidebar')?.classList.remove('navbar-collapsed');
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  closeMenu() {
    if (document.querySelector('app-navigation.pc-sidebar')?.classList.contains('mob-open')) {
      document.querySelector('app-navigation.pc-sidebar')?.classList.remove('mob-open');
    }
  }
}
