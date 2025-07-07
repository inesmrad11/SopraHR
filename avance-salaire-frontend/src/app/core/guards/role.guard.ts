import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as Array<string>;
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authService.getCurrentUser();
  
  if (!currentUser || !currentUser.role) {
    router.navigate(['/login']);
    return false;
  }

  const hasRequiredRole = requiredRoles.includes(currentUser.role);
  
  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (currentUser.role === 'ADMIN' || currentUser.role === 'HR') {
      router.navigate(['/hr/dashboard']);
    } else {
      router.navigate(['/employee/dashboard']);
    }
    return false;
  }

  return true;
}; 