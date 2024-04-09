// ----------------------------------NOTES-----------------------------------
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
  userCreate?: User;
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
  searchIdAssignee: string[];
  searchUserCreate: string[];
}

export interface PagePagination {
  page: number;
  limit: number;
}

// ------------------------------------PROJECTS--------------------------------------------
export interface ProjectType {
  id: number;
  name: string;
  projectUsers?: [];
  userCreate?: User;
}
export interface DataProjects {
  totalProject: number;
  listProject: ProjectType[];
}
export interface FilterProjects {
  searchProject: string;
}

export interface Project {
  id?: number;
  name: string;
}

export interface BodyProject {
  selectedUserId: string[];
  currentIdProject: number;
  defaultProject: "";
}
