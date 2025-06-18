import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipEditedEvent, MatChipInputEvent } from "@angular/material/chips";
import { NotesService } from "../../../core/services/notes.service";
import { Note } from "../../../shared/models/note.model";

@Component({
  selector: "app-note-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="max-w-4xl mx-auto px-2 sm:px-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold">
            {{
              isEditMode
                ? "Edit Note: " + (currentNote?.title || "")
                : "Create New Note"
            }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="isLoading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>

          <form
            *ngIf="!isLoading"
            [formGroup]="noteForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <mat-form-field class="form-field w-full">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" required />
              <mat-error *ngIf="noteForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="form-field w-full">
              <mat-label>Content</mat-label>
              <textarea
                matInput
                formControlName="content"
                rows="10"
                placeholder="Write your note content here..."
                required
              >
              </textarea>
              <mat-error *ngIf="noteForm.get('content')?.hasError('required')">
                Content is required
              </mat-error>
            </mat-form-field>

            <div>
              <mat-form-field class="form-field w-full">
                <mat-label>Tags</mat-label>
                <mat-chip-grid #chipGrid aria-label="Enter tags">
                  <mat-chip-row
                    *ngFor="let tag of tags"
                    (removed)="removeTag(tag)"
                    [editable]="true"
                    (edited)="editTag(tag, $event)"
                    [aria-description]="'press enter to edit ' + tag"
                  >
                    {{ tag }}
                    <button matChipRemove [attr.aria-label]="'remove ' + tag">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                  <input
                    placeholder="Add tag..."
                    [matChipInputFor]="chipGrid"
                    [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                    [matChipInputAddOnBlur]="true"
                    (matChipInputTokenEnd)="addTag($event)"
                  />
                </mat-chip-grid>
              </mat-form-field>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center">
              <mat-checkbox formControlName="isArchived">
                Archive this note
              </mat-checkbox>
            </div>

            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="noteForm.invalid || isSaving"
              >
                <mat-spinner
                  diameter="20"
                  *ngIf="isSaving"
                  class="mr-2"
                ></mat-spinner>
                {{ isEditMode ? "Update Note" : "Create Note" }}
              </button>

              <button mat-button type="button" (click)="onCancel()">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class NoteFormComponent implements OnInit {
  noteForm: FormGroup;
  tags: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  currentNote: Note | null = null;
  noteId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.noteForm = this.fb.group({
      title: ["", Validators.required],
      content: ["", Validators.required],
      isArchived: [false],
    });
  }

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.noteId;

    if (this.isEditMode && this.noteId) {
      this.loadNote(this.noteId);
    }
  }

  loadNote(id: string): void {
    this.isLoading = true;
    this.notesService.getNoteById(id).subscribe({
      next: (note) => {
        this.currentNote = note;
        this.noteForm.patchValue({
          title: note.title,
          content: note.content,
          isArchived: note.isArchived,
        });
        this.tags = [...note.tags];
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open("Failed to load note", "Close", { duration: 3000 });
        this.router.navigate(["/notes"]);
      },
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  editTag(tag: string, event: MatChipEditedEvent): void {
    const value = event.value.trim();
    if (!value) {
      this.removeTag(tag);
      return;
    }

    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags[index] = value;
    }
  }

  onSubmit(): void {
    if (this.noteForm.valid) {
      this.isSaving = true;

      const noteData = {
        ...this.noteForm.value,
        tags: this.tags,
      };

      const operation =
        this.isEditMode && this.noteId
          ? this.notesService.updateNote(this.noteId, noteData)
          : this.notesService.createNote(noteData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode
              ? "Note updated successfully"
              : "Note created successfully",
            "Close",
            { duration: 3000 },
          );
          this.router.navigate(["/notes"]);
        },
        error: (error) => {
          this.snackBar.open(
            `Failed to ${this.isEditMode ? "update" : "create"} note`,
            "Close",
            { duration: 3000 },
          );
          this.isSaving = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(["/notes"]);
  }
}
