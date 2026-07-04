import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Guard: requires any logged-in user */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

/** Guard: requires admin role */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

/** Guard: requires RH mode and approved status */
export const rhGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isRhApproved()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
