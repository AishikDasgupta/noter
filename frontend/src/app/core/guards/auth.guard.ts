// auth.guard.ts - Protects routes from unauthenticated access
// This Angular route guard checks if the user is authenticated before allowing access to protected routes.
// If not authenticated, the user is redirected to the login page.

import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow navigation if authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login if not authenticated
  router.navigate(["/login"]);
  return false;
};
