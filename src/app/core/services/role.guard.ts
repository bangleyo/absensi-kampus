import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (requiredRole: 'ADMIN' | 'STUDENT'): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Cek Login
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    // 2. Cek Role
    if (authService.hasRole(requiredRole)) {
      return true; // Boleh masuk
    }

    // 3. Jika salah kamar (misal Student mau ke Admin)
    // Redirect ke dashboard default mereka atau halaman 403
    return router.createUrlTree(['/dashboard']);
  };
};
