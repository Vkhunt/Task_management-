"use client";

import { CheckCircle2, Circle, Timer, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface StatsCardsProps {
  tasks: Task[];
}

export default function StatsCards({ tasks }: StatsCardsProps) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  const stats = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListChecks,
      gradient: "from-violet-600 to-indigo-600",
      glow: "shadow-violet-600/30",
      bg: "bg-violet-950",
      textColor: "text-violet-300",
    },
    {
      label: "To Do",
      value: todo,
      icon: Circle,
      gradient: "from-slate-600 to-slate-700",
      glow: "shadow-slate-600/20",
      bg: "bg-slate-800",
      textColor: "text-slate-300",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Timer,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/30",
      bg: "bg-amber-950",
      textColor: "text-amber-300",
    },
    {
      label: "Done",
      value: done,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/30",
      bg: "bg-emerald-950",
      textColor: "text-emerald-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(
        ({ label, value, icon: Icon, gradient, glow, bg, textColor }) => (
          <div
            key={label}
            className={cn("rounded-2xl border border-slate-800 p-4 sm:p-5", bg)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {label}
              </span>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg",
                  gradient,
                  glow,
                )}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className={cn("text-3xl font-bold", textColor)}>{value}</p>
          </div>
        ),
      )}
    </div>
  );
}
