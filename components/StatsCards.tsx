"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Timer,
  ListChecks,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { useAppSelector } from "@/store/hooks";
import { selectColumns } from "@/store/features/tasksSlice";

interface StatsCardsProps {
  tasks: Task[];
}

// Style palette for built-in columns
const BUILT_IN_STYLES: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    glow: string;
    bg: string;
    textColor: string;
  }
> = {
  todo: {
    icon: Circle,
    gradient: "from-slate-600 to-slate-700",
    glow: "shadow-slate-600/20",
    bg: "bg-slate-800",
    textColor: "text-slate-300",
  },
  "in-progress": {
    icon: Timer,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
    bg: "bg-amber-950",
    textColor: "text-amber-300",
  },
  done: {
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30",
    bg: "bg-emerald-950",
    textColor: "text-emerald-300",
  },
};

// Rotating palette for custom columns so each gets a distinct color
const CUSTOM_PALETTE = [
  {
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    bg: "bg-violet-950",
    textColor: "text-violet-300",
  },
  {
    gradient: "from-sky-500 to-cyan-600",
    glow: "shadow-sky-500/30",
    bg: "bg-sky-950",
    textColor: "text-sky-300",
  },
  {
    gradient: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/30",
    bg: "bg-pink-950",
    textColor: "text-pink-300",
  },
  {
    gradient: "from-lime-500 to-green-600",
    glow: "shadow-lime-500/30",
    bg: "bg-lime-950",
    textColor: "text-lime-300",
  },
  {
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/30",
    bg: "bg-orange-950",
    textColor: "text-orange-300",
  },
];

export default function StatsCards({ tasks }: StatsCardsProps) {
  const columns = useAppSelector(selectColumns);

  // Build per-column counts once, keyed by column id
  const countByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      map[t.status] = (map[t.status] ?? 0) + 1;
    });
    return map;
  }, [tasks]);

  // Per-column stats cards (dynamic — reacts to addColumn / removeColumn)
  let customIndex = 0;
  const columnStats = columns.map((col) => {
    const builtIn = BUILT_IN_STYLES[col.id];
    const style =
      builtIn ?? CUSTOM_PALETTE[customIndex++ % CUSTOM_PALETTE.length];
    return {
      key: col.id,
      label: col.label,
      value: countByStatus[col.id] ?? 0,
      icon: "icon" in style ? style.icon : LayoutGrid,
      gradient: style.gradient,
      glow: style.glow,
      bg: style.bg,
      textColor: style.textColor,
    };
  });

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`,
      }}
    >
      {/* Total Tasks — always first */}
      <div className="rounded-2xl border border-slate-800 bg-violet-950 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            Total Tasks
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30">
            <ListChecks className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold text-violet-300">{tasks.length}</p>
      </div>

      {/* One card per column — updates instantly when columns change */}
      {columnStats.map(
        ({ key, label, value, icon: Icon, gradient, glow, bg, textColor }) => (
          <div
            key={key}
            className={cn("rounded-2xl border border-slate-800 p-4 sm:p-5", bg)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 truncate max-w-[80px]">
                {label}
              </span>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg shrink-0",
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
