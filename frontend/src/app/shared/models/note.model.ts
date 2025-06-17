export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  owner: string;
  sharedWith: NoteShare[];
}

export interface NoteShare {
  user: string;
  username: string;
  permission: "read-only" | "read-write";
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
}

export interface UpdateNoteRequest {
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
}

export interface ShareNoteRequest {
  sharedWithUsername: string;
  permission: "read-only" | "read-write";
}

export interface NotesResponse {
  notes: Note[];
  total: number;
  page: number;
  totalPages: number;
}
