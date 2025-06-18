import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
// MatFab is part of MatButtonModule
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatMenuModule } from "@angular/material/menu";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { NotesService } from "../../../core/services/notes.service";
import { Note } from "../../../shared/models/note.model";
import { ShareDialogComponent } from "../share-dialog/share-dialog.component";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-notes-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,

    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  template: `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">My Notes</h1>

      <!-- Search and Filter -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <mat-form-field>
          <mat-label>Search notes...</mat-label>
          <input
            matInput
            [formControl]="searchControl"
            placeholder="Search by title or content"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Filter by tags</mat-label>
          <input
            matInput
            [formControl]="tagsControl"
            placeholder="Enter tags separated by commas"
          />
          <mat-icon matSuffix>label</mat-icon>
        </mat-form-field>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div *ngIf="isLoading" class="loading-spinner">
      <mat-spinner></mat-spinner>
    </div>

    <!-- Notes Grid -->
    <div
      *ngIf="!isLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
    >
      <mat-card
        *ngFor="let note of notes"
        class="card-shadow hover:scale-105 transition-transform"
      >
        <mat-card-header>
          <mat-card-title class="text-lg font-semibold truncate">{{
            note.title
          }}</mat-card-title>
          <mat-card-subtitle class="text-sm text-gray-500">
            Created: {{ note.createdAt | date: "short" }}
          </mat-card-subtitle>
          <button mat-icon-button [matMenuTriggerFor]="noteMenu">
            <mat-icon>more_vert</mat-icon>
          </button>

          <mat-menu #noteMenu="matMenu">
            <button mat-menu-item [routerLink]="['/notes', note._id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-menu-item (click)="openShareDialog(note)">
              <mat-icon>share</mat-icon>
              Share
            </button>
            <button mat-menu-item (click)="toggleArchive(note)">
              <mat-icon>{{
                note.isArchived ? "unarchive" : "archive"
              }}</mat-icon>
              {{ note.isArchived ? "Unarchive" : "Archive" }}
            </button>
            <button
              mat-menu-item
              (click)="deleteNote(note._id)"
              class="text-red-600"
            >
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-menu>
        </mat-card-header>

        <mat-card-content>
          <p class="text-gray-700 mb-4 line-clamp-3">{{ note.content }}</p>

          <div class="flex flex-wrap gap-1 mb-4" *ngIf="note.tags.length > 0">
            <mat-chip *ngFor="let tag of note.tags" class="text-xs">{{ tag }}</mat-chip>
          </div>

          <!-- Show who shared the note if not owned by current user -->
          <div *ngIf="note.owner && note.owner._id !== currentUser?._id" class="mb-2 text-sm text-blue-700">
            Shared by: {{ note.owner.username || note.owner.email }}
          </div>

          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Updated: {{ note.updatedAt | date: 'short' }}</span>
            <mat-icon *ngIf="note.isArchived" class="text-orange-500">archive</mat-icon>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Empty State -->
    <div *ngIf="!isLoading && notes.length === 0" class="text-center py-12">
      <mat-icon class="text-gray-400 text-6xl mb-4">note_add</mat-icon>
      <h2 class="text-2xl font-semibold text-gray-600 mb-2">No notes found</h2>
      <p class="text-gray-500 mb-6">Start by creating your first note!</p>
      <button mat-raised-button color="primary" routerLink="/notes/new">
        <mat-icon>add</mat-icon>
        Create Note
      </button>
    </div>

    <!-- Pagination -->
    <mat-paginator
      *ngIf="totalItems > 0"
      [length]="totalItems"
      [pageSize]="pageSize"
      [pageSizeOptions]="[5, 10, 25, 50]"
      (page)="onPageChange($event)"
      class="mt-8"
    >
    </mat-paginator>

    <!-- Floating Action Button -->
    <button
      mat-fab
      color="primary"
      routerLink="/notes/new"
      class="fixed bottom-6 right-6 z-10"
    >
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: [
    `
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  totalItems = 0;
  currentPage = 0;
  pageSize = 5;
  isLoading = false;

  searchControl = new FormControl("");
  tagsControl = new FormControl("");

  currentUser: import("../../../shared/models/user.model").User | null = null;

  constructor(
    private notesService: NotesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadNotes();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 0;
        this.loadNotes();
      });

    this.tagsControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 0;
        this.loadNotes();
      });
  }

  loadNotes(): void {
    this.isLoading = true;

    const params = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      search: this.searchControl.value || undefined,
      tags: this.tagsControl.value || undefined,
    };

    this.notesService.getNotes(params).subscribe({
      next: (response) => {
        this.notes = response.notes;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open("Failed to load notes", "Close", { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNotes();
  }

  openShareDialog(note: Note): void {
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: "500px",
      data: note,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadNotes();
      }
    });
  }

  toggleArchive(note: Note): void {
    const updatedNote = { ...note, isArchived: !note.isArchived };
    this.notesService.updateNote(note._id, updatedNote).subscribe({
      next: () => {
        this.snackBar.open(
          note.isArchived ? "Note unarchived" : "Note archived",
          "Close",
          { duration: 3000 },
        );
        this.loadNotes();
      },
      error: () => {
        this.snackBar.open("Failed to update note", "Close", {
          duration: 3000,
        });
      },
    });
  }

  deleteNote(noteId: string): void {
    if (confirm("Are you sure you want to delete this note?")) {
      this.notesService.deleteNote(noteId).subscribe({
        next: () => {
          this.snackBar.open("Note deleted", "Close", { duration: 3000 });
          this.loadNotes();
        },
        error: () => {
          this.snackBar.open("Failed to delete note", "Close", {
            duration: 3000,
          });
        },
      });
    }
  }
}
