import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/notes",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: "notes",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/notes/notes-list/notes-list.component").then(
        (m) => m.NotesListComponent,
      ),
  },
  {
    path: "notes/new",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/notes/note-form/note-form.component").then(
        (m) => m.NoteFormComponent,
      ),
  },
  {
    path: "notes/:id/edit",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/notes/note-form/note-form.component").then(
        (m) => m.NoteFormComponent,
      ),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "profile",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/profile/profile.component").then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: "**",
    redirectTo: "/notes",
  },
];
