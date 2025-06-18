import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router, RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { AuthService } from "./core/services/auth.service";
import { Observable } from "rxjs";
import { User } from "./shared/models/user.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <mat-toolbar color="primary" *ngIf="currentUser$ | async as user">
        <span class="flex-1 text-xl font-bold">Notes Manager</span>

        <div class="flex items-center space-x-4">
          <button mat-button routerLink="/notes">
            <mat-icon>note</mat-icon>
            Notes
          </button>

          <button mat-button routerLink="/dashboard" *ngIf="user.role === 'admin'">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>

          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ user.username }}
          </button>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              Profile
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <main class="container mx-auto px-4 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1200px;
      }
    `,
  ],
})
export class AppComponent {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
