// analytics.service.ts - Fetches analytics data for admin dashboard
// This service provides methods to retrieve most active users, most used tags, and notes created per day for analytics purposes.

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  ActiveUser,
  TagUsage,
  DailyNoteCount,
} from "../../shared/models/analytics.model";

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  // Fetches the most active users (top 5 by note count)
  getMostActiveUsers(): Observable<ActiveUser[]> {
    return this.http.get<ActiveUser[]>(
      `${environment.apiUrl}/admin/analytics/most-active-users`,
    );
  }

  // Fetches the most used tags (top 10 by usage count)
  getMostUsedTags(): Observable<TagUsage[]> {
    return this.http.get<TagUsage[]>(
      `${environment.apiUrl}/admin/analytics/most-used-tags`,
    );
  }

  // Fetches the number of notes created per day for the last 7 days
  getNotesCreatedDaily(): Observable<DailyNoteCount[]> {
    return this.http.get<DailyNoteCount[]>(
      `${environment.apiUrl}/admin/analytics/notes-created-daily`,
    );
  }
}
