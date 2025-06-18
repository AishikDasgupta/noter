import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from "../../core/services/auth.service";
import { User } from "../../shared/models/user.model";
import { Observable } from "rxjs";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto px-2 sm:px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>

      <mat-card class="card-shadow" *ngIf="currentUser$ | async as user">
        <mat-card-header>
          <div class="flex items-center space-x-4">
            <div
              class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            >
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <mat-card-title class="text-xl">{{
                user.username
              }}</mat-card-title>
              <mat-card-subtitle>{{ user.email }}</mat-card-subtitle>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content class="mt-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded">
              <h3 class="font-semibold text-gray-700 mb-2">User Information</h3>
              <div class="space-y-2">
                <div>
                  <span class="text-sm text-gray-500">User ID:</span>
                  <span class="ml-2 font-mono text-sm">{{ user._id }}</span>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Username:</span>
                  <span class="ml-2">{{ user.username }}</span>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Email:</span>
                  <span class="ml-2">{{ user.email }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded">
              <h3 class="font-semibold text-gray-700 mb-2">Account Actions</h3>
              <div class="space-y-2">
                <button mat-button color="primary" class="w-full justify-start">
                  <mat-icon>edit</mat-icon>
                  Edit Profile (Coming Soon)
                </button>
                <button mat-button color="primary" class="w-full justify-start">
                  <mat-icon>lock</mat-icon>
                  Change Password (Coming Soon)
                </button>
                <button mat-button color="warn" class="w-full justify-start">
                  <mat-icon>delete</mat-icon>
                  Delete Account (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/notes">
            <mat-icon>arrow_back</mat-icon>
            Back to Notes
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Profile component initialization
  }
}
