// auth.interceptor.ts - Attaches JWT token to outgoing HTTP requests
// This Angular HTTP interceptor automatically adds the Authorization header with the JWT token (if present) to every outgoing HTTP request.
// This allows the backend to authenticate the user for protected endpoints.

import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // If a JWT token exists, clone the request and add the Authorization header
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });
    return next(authReq);
  }

  // If no token, send the request as-is
  return next(req);
};
