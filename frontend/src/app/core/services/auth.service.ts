// auth.service.ts - Handles user authentication and session management
// This service provides methods for login, registration, logout, and user state management using JWT tokens and RxJS observables.

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../../shared/models/user.model";
import { ActivatedRouteSnapshot } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // Holds the current user state (null if not logged in)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  // Observable for components to subscribe to user changes
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  // Loads the current user from localStorage if available (on app start)
  private loadCurrentUser(): void {
    const token = this.getToken();
    const userData = localStorage.getItem("currentUser");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        // If parsing fails, clear session
        this.logout();
      }
    }
  }

  // Sends login request to backend and stores token/user on success
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          // Store JWT and user info in localStorage
          localStorage.setItem("token", response.token);
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
      );
  }

  // Sends registration request to backend
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(
      `${environment.apiUrl}/auth/register`,
      userData,
    );
  }

  // Logs out the user and clears localStorage/session
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }

  // Retrieves JWT token from localStorage (for attaching to requests)
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Checks if user is authenticated (token exists)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Returns the current user object (or null)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Optionally, add more helper methods as needed (e.g., isAdmin)
}

// RoleGuard can be used to protect routes based on user role
@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const user = this.authService.getCurrentUser();
    return user?.role === requiredRole;
  }
}
