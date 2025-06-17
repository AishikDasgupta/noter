import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NotesService } from "../../../core/services/notes.service";
import { Note, NoteShare } from "../../../shared/models/note.model";

@Component({
  selector: "app-share-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Share Note: {{ note.title }}</h2>

    <mat-dialog-content class="min-w-96">
      <!-- Current Shares -->
      <div *ngIf="note.sharedWith.length > 0" class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Currently Shared With:</h3>
        <mat-list>
          <mat-list-item *ngFor="let share of note.sharedWith" class="border-b">
            <div class="flex justify-between items-center w-full">
              <div>
                <span class="font-medium">{{ share.username }}</span>
                <span class="text-sm text-gray-500 ml-2"
                  >({{ share.permission }})</span
                >
              </div>
              <div class="flex space-x-2">
                <mat-form-field appearance="outline" class="w-32">
                  <mat-select
                    [value]="share.permission"
                    (selectionChange)="
                      updatePermission(share.user, $event.value)
                    "
                  >
                    <mat-option value="read-only">Read Only</mat-option>
                    <mat-option value="read-write">Read Write</mat-option>
                  </mat-select>
                </mat-form-field>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="removeShare(share.user)"
                  [disabled]="isUpdating"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-list-item>
        </mat-list>
      </div>

      <!-- Add New Share -->
      <div>
        <h3 class="text-lg font-semibold mb-3">Share with New User:</h3>
        <form [formGroup]="shareForm" (ngSubmit)="addShare()">
          <mat-form-field class="form-field">
            <mat-label>Username</mat-label>
            <input
              matInput
              formControlName="username"
              placeholder="Enter username"
            />
            <mat-error *ngIf="shareForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field">
            <mat-label>Permission</mat-label>
            <mat-select formControlName="permission">
              <mat-option value="read-only">Read Only</mat-option>
              <mat-option value="read-write">Read Write</mat-option>
            </mat-select>
          </mat-form-field>

          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="shareForm.invalid || isSharing"
            class="w-full"
          >
            <mat-spinner
              diameter="20"
              *ngIf="isSharing"
              class="mr-2"
            ></mat-spinner>
            Share Note
          </button>
        </form>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Close</button>
    </mat-dialog-actions>
  `,
})
export class ShareDialogComponent {
  shareForm: FormGroup;
  isSharing = false;
  isUpdating = false;

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public note: Note,
  ) {
    this.shareForm = this.fb.group({
      username: ["", Validators.required],
      permission: ["read-only", Validators.required],
    });
  }

  addShare(): void {
    if (this.shareForm.valid) {
      this.isSharing = true;

      const shareData = {
        sharedWithUsername: this.shareForm.get("username")?.value,
        permission: this.shareForm.get("permission")?.value,
      };

      this.notesService.shareNote(this.note._id, shareData).subscribe({
        next: (updatedNote) => {
          this.note = updatedNote;
          this.shareForm.reset({ permission: "read-only" });
          this.snackBar.open("Note shared successfully", "Close", {
            duration: 3000,
          });
          this.isSharing = false;
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || "Failed to share note",
            "Close",
            { duration: 3000 },
          );
          this.isSharing = false;
        },
      });
    }
  }

  updatePermission(userId: string, permission: string): void {
    this.isUpdating = true;

    this.notesService
      .updateNotePermission(this.note._id, userId, permission)
      .subscribe({
        next: (updatedNote) => {
          this.note = updatedNote;
          this.snackBar.open("Permission updated", "Close", { duration: 3000 });
          this.isUpdating = false;
        },
        error: (error) => {
          this.snackBar.open("Failed to update permission", "Close", {
            duration: 3000,
          });
          this.isUpdating = false;
        },
      });
  }

  removeShare(userId: string): void {
    if (confirm("Are you sure you want to remove this share?")) {
      this.isUpdating = true;

      this.notesService.removeNoteShare(this.note._id, userId).subscribe({
        next: (updatedNote) => {
          this.note = updatedNote;
          this.snackBar.open("Share removed", "Close", { duration: 3000 });
          this.isUpdating = false;
        },
        error: (error) => {
          this.snackBar.open("Failed to remove share", "Close", {
            duration: 3000,
          });
          this.isUpdating = false;
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(true);
  }
}
