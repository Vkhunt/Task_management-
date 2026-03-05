"use client";

import Link from "next/link";
import { Folder, Trash2 } from "lucide-react";
import type { Project, Task } from "@/types/task";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  violet: "from-violet-500 to-indigo-600 shadow-violet-500/20",
  indigo: "from-indigo-500 to-blue-600 shadow-indigo-500/20",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/20",
  amber: "from-amber-500 to-orange-600 shadow-amber-500/20",
  teal: "from-teal-500 to-cyan-600 shadow-teal-500/20",
  sky: "from-sky-500 to-blue-600 shadow-sky-500/20",
};

const COLOR_BG: Record<string, string> = {
  violet: "bg-violet-950/40 border-violet-800/40",
  indigo: "bg-indigo-950/40 border-indigo-800/40",
  rose: "bg-rose-950/40 border-rose-800/40",
  amber: "bg-amber-950/40 border-amber-800/40",
  teal: "bg-teal-950/40 border-teal-800/40",
  sky: "bg-sky-950/40 border-sky-800/40",
};

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  tasks,
  onDelete,
}: ProjectCardProps) {
  const gradient = COLOR_MAP[project.color] ?? COLOR_MAP.violet;
  const bg = COLOR_BG[project.color] ?? COLOR_BG.violet;
  const taskCount = tasks.filter((t) => t.projectId === project.id).length;
  const doneCount = tasks.filter(
    (t) => t.projectId === project.id && t.status === "done",
  ).length;
  const progress =
    taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border p-5 transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl",
        bg,
      )}
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(project.id);
        }}
        className="absolute top-3 right-3 rounded-lg p-1 text-slate-600 hover:bg-red-950 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete project"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Link href={`/projects/${project.id}`} className="block">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg mb-4",
            gradient,
          )}
        >
          <Folder className="h-5 w-5 text-white" />
        </div>

        {/* Name + description */}
        <h3 className="text-base font-semibold text-white truncate mb-0.5">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>{taskCount} tasks</span>
          <span>{progress}% done</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-500",
              gradient,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </Link>
    </div>
  );
}
