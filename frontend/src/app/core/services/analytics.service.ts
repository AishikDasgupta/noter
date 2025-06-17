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

  getMostActiveUsers(): Observable<ActiveUser[]> {
    return this.http.get<ActiveUser[]>(
      `${environment.apiUrl}/admin/analytics/most-active-users`,
    );
  }

  getMostUsedTags(): Observable<TagUsage[]> {
    return this.http.get<TagUsage[]>(
      `${environment.apiUrl}/admin/analytics/most-used-tags`,
    );
  }

  getNotesCreatedDaily(): Observable<DailyNoteCount[]> {
    return this.http.get<DailyNoteCount[]>(
      `${environment.apiUrl}/admin/analytics/notes-created-daily`,
    );
  }
}
