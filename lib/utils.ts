import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO } from "date-fns";
import type { Task, TaskFilters } from "@/types/task";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, "MMM d, yyyy") : "—";
}

export function formatDateTime(dateStr: string): string {
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, "MMM d, yyyy h:mm a") : "—";
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  const d = parseISO(dueDate);
  return isValid(d) && d < new Date();
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      task.title.toLowerCase().includes(searchLower) ||
      (task.description || "").toLowerCase().includes(searchLower);

    const matchesStatus =
      filters.status === "all" || task.status === filters.status;

    const matchesPriority =
      filters.priority === "all" || task.priority === filters.priority;

    const matchesDate = !filters.date || task.dueDate === filters.date;

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });
}

export const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
