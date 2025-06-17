import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { AnalyticsService } from "../../core/services/analytics.service";
import {
  ActiveUser,
  TagUsage,
  DailyNoteCount,
} from "../../shared/models/analytics.model";

Chart.register(...registerables);

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
    </div>

    <div *ngIf="isLoading" class="loading-spinner">
      <mat-spinner></mat-spinner>
    </div>

    <div *ngIf="!isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Most Active Users -->
      <mat-card class="card-shadow">
        <mat-card-header>
          <mat-card-title>Most Active Users</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div
            class="space-y-3"
            *ngIf="activeUsers.length > 0; else noActiveUsers"
          >
            <div
              *ngFor="let user of activeUsers"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span class="font-medium">{{ user.username }}</span>
              <span class="text-blue-600 font-semibold"
                >{{ user.noteCount }} notes</span
              >
            </div>
          </div>
          <ng-template #noActiveUsers>
            <p class="text-gray-500 text-center py-8">No data available</p>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <!-- Most Used Tags -->
      <mat-card class="card-shadow">
        <mat-card-header>
          <mat-card-title>Most Used Tags</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas #tagsChart width="400" height="300"></canvas>
        </mat-card-content>
      </mat-card>

      <!-- Notes Created Daily Chart -->
      <mat-card class="card-shadow lg:col-span-2">
        <mat-card-header>
          <mat-card-title>Notes Created (Last 7 Days)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas #dailyChart width="800" height="400"></canvas>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("tagsChart") tagsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild("dailyChart") dailyChart!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  activeUsers: ActiveUser[] = [];
  tagUsage: TagUsage[] = [];
  dailyNotes: DailyNoteCount[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  loadAnalyticsData(): void {
    Promise.all([
      this.analyticsService.getMostActiveUsers().toPromise(),
      this.analyticsService.getMostUsedTags().toPromise(),
      this.analyticsService.getNotesCreatedDaily().toPromise(),
    ])
      .then(([activeUsers, tagUsage, dailyNotes]) => {
        this.activeUsers = activeUsers || [];
        this.tagUsage = tagUsage || [];
        this.dailyNotes = dailyNotes || [];

        setTimeout(() => {
          this.createCharts();
        }, 100);

        this.isLoading = false;
      })
      .catch((error) => {
        console.error("Failed to load analytics data:", error);
        this.isLoading = false;
      });
  }

  createCharts(): void {
    this.createTagsChart();
    this.createDailyChart();
  }

  createTagsChart(): void {
    if (!this.tagsChart?.nativeElement || this.tagUsage.length === 0) return;

    const ctx = this.tagsChart.nativeElement.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: this.tagUsage.map((tag) => tag.tag),
        datasets: [
          {
            data: this.tagUsage.map((tag) => tag.count),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  createDailyChart(): void {
    if (!this.dailyChart?.nativeElement || this.dailyNotes.length === 0) return;

    const ctx = this.dailyChart.nativeElement.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
      type: "line",
      data: {
        labels: this.dailyNotes.map((day) =>
          new Date(day.date).toLocaleDateString(),
        ),
        datasets: [
          {
            label: "Notes Created",
            data: this.dailyNotes.map((day) => day.count),
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54, 162, 235, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}
