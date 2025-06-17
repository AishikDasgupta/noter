import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
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

  getNotes(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      tags?: string;
    } = {},
  ): Observable<NotesResponse> {
    let httpParams = new HttpParams();

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

  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${environment.apiUrl}/notes/${id}`);
  }

  createNote(note: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(`${environment.apiUrl}/notes`, note);
  }

  updateNote(id: string, note: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${environment.apiUrl}/notes/${id}`, note);
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/notes/${id}`);
  }

  shareNote(noteId: string, shareData: ShareNoteRequest): Observable<Note> {
    return this.http.post<Note>(
      `${environment.apiUrl}/notes/${noteId}/share`,
      shareData,
    );
  }

  updateNotePermission(
    noteId: string,
    sharedWithUserId: string,
    permission: string,
  ): Observable<Note> {
    return this.http.put<Note>(
      `${environment.apiUrl}/notes/${noteId}/share/${sharedWithUserId}`,
      { permission },
    );
  }

  removeNoteShare(noteId: string, sharedWithUserId: string): Observable<Note> {
    return this.http.delete<Note>(
      `${environment.apiUrl}/notes/${noteId}/share/${sharedWithUserId}`,
    );
  }
}
