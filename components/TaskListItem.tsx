"use client";

import Link from "next/link";
import { Calendar, User, Folder, ArrowRight } from "lucide-react";
import type { Task, Project } from "@/types/task";
import { cn, formatDate, isOverdue } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  todo: "text-slate-400 bg-slate-800 border-slate-700",
  "in-progress": "text-amber-400 bg-amber-950 border-amber-800",
  done: "text-emerald-400 bg-emerald-950 border-emerald-800",
};

const PRIORITY_DOTS: Record<string, string> = {
  low: "bg-sky-400",
  medium: "bg-amber-400",
  high: "bg-red-400",
};

const PROJECT_COLORS: Record<string, string> = {
  violet: "text-violet-400 bg-violet-950/50 border-violet-800/50",
  indigo: "text-indigo-400 bg-indigo-950/50 border-indigo-800/50",
  rose: "text-rose-400 bg-rose-950/50 border-rose-800/50",
  amber: "text-amber-400 bg-amber-950/50 border-amber-800/50",
  teal: "text-teal-400 bg-teal-950/50 border-teal-800/50",
  sky: "text-sky-400 bg-sky-950/50 border-sky-800/50",
};

interface TaskListItemProps {
  task: Task;
  project?: Project;
}

export default function TaskListItem({ task, project }: TaskListItemProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== "done";
  const statusClass =
    STATUS_COLORS[task.status] ??
    "text-violet-400 bg-violet-950 border-violet-800";
  const projectColor = project
    ? (PROJECT_COLORS[project.color] ?? PROJECT_COLORS.violet)
    : "";

  return (
    <Link
      href={`/tasks/${task.id}?from=dashboard`}
      className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:border-violet-700 hover:shadow-md hover:shadow-violet-900/20 transition-all duration-200"
    >
      {/* Priority dot */}
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          PRIORITY_DOTS[task.priority] ?? "bg-slate-500",
        )}
      />

      {/* Title */}
      <span
        className={cn(
          "flex-1 text-sm font-medium text-white truncate group-hover:text-violet-200 transition-colors",
          task.status === "done" && "line-through text-slate-500",
        )}
      >
        {task.title}
      </span>

      {/* Status badge */}
      <span
        className={cn(
          "hidden sm:inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
          statusClass,
        )}
      >
        {task.status === "in-progress"
          ? "In Progress"
          : task.status === "done"
            ? "Done"
            : "To Do"}
      </span>

      {/* Project chip */}
      {project && (
        <span
          className={cn(
            "hidden md:inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            projectColor,
          )}
        >
          <Folder className="h-2.5 w-2.5" />
          {project.name}
        </span>
      )}

      {/* Assigned to */}
      {task.assignedTo && (
        <span className="hidden lg:flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
          <User className="h-3 w-3" />
          {task.assignedTo}
        </span>
      )}

      {/* Due date */}
      {task.dueDate && (
        <span
          className={cn(
            "hidden sm:flex shrink-0 items-center gap-1 text-[10px]",
            overdue ? "text-red-400 font-medium" : "text-slate-500",
          )}
        >
          <Calendar className="h-3 w-3" />
          {formatDate(task.dueDate)}
        </span>
      )}

      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-violet-400 transition-colors" />
    </Link>
  );
}
