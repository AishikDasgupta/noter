import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex justify-center items-center min-h-screen">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="text-center mb-6">
          <mat-card-title class="text-2xl font-bold">Register</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="form-field">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" required />
              <mat-error
                *ngIf="registerForm.get('username')?.hasError('required')"
              >
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="form-field">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required />
              <mat-error
                *ngIf="registerForm.get('email')?.hasError('required')"
              >
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field class="form-field">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                required
              />
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('required')"
              >
                Password is required
              </mat-error>
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('minlength')"
              >
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field class="form-field">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmPassword"
                required
              />
              <mat-error
                *ngIf="
                  registerForm.get('confirmPassword')?.hasError('required')
                "
              >
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="w-full"
              [disabled]="registerForm.invalid || isLoading"
            >
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Register</span>
            </button>
          </form>

          <div class="text-center mt-4">
            <p>
              Already have an account?
              <a routerLink="/login" class="text-blue-600 hover:underline"
                >Login here</a
              >
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = "";
  successMessage = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        username: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: () => {
          this.successMessage =
            "Registration successful! Redirecting to login...";
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || "Registration failed. Please try again.";
          this.isLoading = false;
        },
      });
    }
  }
}
