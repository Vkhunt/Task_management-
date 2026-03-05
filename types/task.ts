// Built-in status IDs — custom columns will use arbitrary strings
export type TaskStatus = string;
export type TaskPriority = "low" | "medium" | "high";

// Built-in column definitions (used as defaults)
export const BUILT_IN_COLUMNS: { id: string; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date string YYYY-MM-DD (required)
  assignedTo?: string;
  projectId?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = Pick<
  Project,
  "name" | "description" | "color"
>;

export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskFilters {
  search: string;
  status: string; // "all" or any column id
  priority: TaskPriority | "all";
  date: string;
}
