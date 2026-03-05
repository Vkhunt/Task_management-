"use client";

import { useState } from "react";
import { RefreshCw, LogIn, List, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useAppSelector } from "@/store/hooks";
import TaskListItem from "@/components/TaskListItem";
import DonutChart from "@/components/DonutChart";
import type { Task, Project } from "@/types/task";
import { cn } from "@/lib/utils";

const PROJECT_COLORS: Record<string, string> = {
  violet: "border-violet-600 bg-violet-600/20 text-violet-300",
  indigo: "border-indigo-600 bg-indigo-600/20 text-indigo-300",
  rose: "border-rose-600 bg-rose-600/20 text-rose-300",
  amber: "border-amber-600 bg-amber-600/20 text-amber-300",
  teal: "border-teal-600 bg-teal-600/20 text-teal-300",
  sky: "border-sky-600 bg-sky-600/20 text-sky-300",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const allTasks: Task[] = useAppSelector((state) => state.tasks.items);
  const projects: Project[] = useAppSelector((state) => state.projects.items);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  // Filter tasks by selected project
  const visibleTasks =
    selectedProjectId === null
      ? allTasks
      : allTasks.filter((t) => t.projectId === selectedProjectId);

  /* ─── Loading ─── */
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  /* ─── Unauthenticated hero ─── */
  if (status === "unauthenticated") {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[120px]" />
          <div className="absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-700/10 blur-[120px]" />
        </div>
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/30">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Task<span className="text-violet-400">Nova</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              A smarter way to manage your work. Organise tasks into projects,
              track progress in real-time, and never miss a deadline.
            </p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/30 hover:-translate-y-0.5"
          >
            <LogIn className="h-5 w-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-violet-400 mb-1">
            Dashboard
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {session?.user?.name
              ? `Good to see you, ${session.user.name.split(" ")[0]} 👋`
              : "Your Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {allTasks.length === 0
              ? "No tasks yet. Open a project to get started."
              : `${allTasks.filter((t) => t.status !== "done").length} tasks remaining across all projects.`}
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 hover:-translate-y-0.5"
        >
          <FolderOpen className="h-4 w-4" />
          My Projects
          <ArrowRight className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>

      {/* Donut chart card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Task Overview
          </h2>
          <span className="text-xs text-slate-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
        <DonutChart tasks={allTasks} />
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {/* Section header with project filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-white">All Tasks</h2>
            <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400 tabular-nums">
              {visibleTasks.length}
            </span>
          </div>
        </div>

        {/* Project filter chips */}
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProjectId(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                selectedProjectId === null
                  ? "border-violet-600 bg-violet-600/20 text-violet-300"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-violet-600/50 hover:text-slate-300",
              )}
            >
              All Projects
            </button>
            {projects.map((p) => {
              const active = selectedProjectId === p.id;
              const colorClass =
                PROJECT_COLORS[p.color] ?? PROJECT_COLORS.violet;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(active ? null : p.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    active
                      ? colorClass
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300",
                  )}
                >
                  {p.name}
                  <span className="ml-1.5 tabular-nums opacity-60">
                    {allTasks.filter((t) => t.projectId === p.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Task rows */}
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-800 text-center">
            <List className="h-10 w-10 text-slate-700 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              {selectedProjectId
                ? "No tasks in this project yet."
                : "No tasks yet."}
            </p>
            <Link
              href="/projects"
              className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Open a project to add tasks
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              return (
                <TaskListItem key={task.id} task={task} project={project} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
