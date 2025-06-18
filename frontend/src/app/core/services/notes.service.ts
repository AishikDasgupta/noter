// notes.service.ts - Handles all API interactions for notes
// This service provides methods for CRUD operations, sharing, searching, and filtering notes. Used by components to interact with the backend.

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.prod";
import {
  Note,
  NotesResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  ShareNoteRequest,
} from "../../shared/models/note.model";

@Injectable({
  providedIn: "root",
})
export class NotesService {
  constructor(private http: HttpClient) {}

  // Fetches notes for the current user (owned or shared)
  // Supports pagination, search, and tag filtering
  getNotes(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string;
    } = {},
  ): Observable<NotesResponse> {
    let httpParams = new HttpParams();

    // Add query params if provided
    if (params.page)
      httpParams = httpParams.set("page", params.page.toString());
    if (params.limit)
      httpParams = httpParams.set("limit", params.limit.toString());
    if (params.search) httpParams = httpParams.set("search", params.search);
    if (params.tags) httpParams = httpParams.set("tags", params.tags);

    return this.http.get<NotesResponse>(`${environment.apiUrl}/notes`, {
      params: httpParams,
    });
  }

  // Fetches a single note by its ID
  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${environment.apiUrl}/notes/${id}`);
  }

  // Creates a new note (title, content, tags)
  createNote(note: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(`${environment.apiUrl}/notes`, note);
  }

  // Updates an existing note by ID
  updateNote(id: string, note: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${environment.apiUrl}/notes/${id}`, note);
  }

  // Deletes a note by ID
  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/notes/${id}`);
  }

  // Shares a note with another user by username and permission
  // Backend expects { username, permission }
  shareNote(noteId: string, shareData: ShareNoteRequest): Observable<Note> {
    return this.http.post<Note>(
      `${environment.apiUrl}/notes/${noteId}/share`,
      { username: shareData.sharedWithUsername, permission: shareData.permission }
    );
  }

  // Updates sharing permission for a user (calls shareNote with new permission)
  updateNotePermission(
    noteId: string,
    username: string,
    permission: "read-only" | "read-write",
  ): Observable<Note> {
    return this.shareNote(noteId, { sharedWithUsername: username, permission });
  }

  // Unshares a note from a user by username
  unshareNote(noteId: string, username: string): Observable<Note> {
    return this.http.post<Note>(
      `${environment.apiUrl}/notes/${noteId}/unshare`,
      { username }
    );
  }

  // Removes a user's access to a shared note (unshares the note)
  removeNoteShare(noteId: string, username: string): Observable<Note> {
    return this.http.post<Note>(
      `${environment.apiUrl}/notes/${noteId}/unshare`,
      { username }
    );
  }
}
