export interface ActiveUser {
  username: string;
  noteCount: number;
}

export interface TagUsage {
  tag: string;
  count: number;
}

export interface DailyNoteCount {
  date: string;
  count: number;
}
