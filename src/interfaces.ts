export interface DataNotes {
  totalNote: number;
  listNote: NoteType[];
}

export interface NoteType {
  id: number;
  note: string;
  status: string;
  dueDate?: number;
  noteUsers?: [];
}

export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface BodyNote {
  selectedUserId: string[];
  currentIdNote: number;
  currentStatus: string;
  defaultNote: "";
  startDate: Date | null;
}

export interface FilterNotes {
  dateRangeFilter: (Date | null)[];
  currentStatusFilter: string;
  searchNote: string;
  searchIdAssignee: number;
}

export interface PagePagination {
  page: number;
  limit: number;
}
