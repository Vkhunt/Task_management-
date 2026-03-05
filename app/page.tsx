"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { RefreshCw, LogIn, LayoutGrid } from "lucide-react";
import type { Task } from "@/types/task";
import { BUILT_IN_COLUMNS } from "@/types/task";
import KanbanColumn from "@/components/BoardColumn";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import AddColumnModal from "@/components/AddColumnModal";
import { getTasks } from "@/app/actions/task.actions";
import { useSession, signIn } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTasks,
  setFilters,
  selectFilteredTasks,
  selectColumns,
} from "@/store/features/tasksSlice";
import type { ColumnSort } from "@/store/features/tasksSlice";

const BUILT_IN_IDS = new Set(BUILT_IN_COLUMNS.map((c) => c.id));

const DEFAULT_SORT: ColumnSort = { key: "dueDate", direction: "asc" };

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.tasks.filters);
  const sortConfigs = useAppSelector((state) => state.tasks.sortConfig);
  const columns = useAppSelector(selectColumns);
  const filteredTasks: Task[] = useAppSelector(selectFilteredTasks);
  const allTasks: Task[] = useAppSelector((state) => state.tasks.items);

  const [showAddColumn, setShowAddColumn] = useState(false);

  const tasksByColumn = useMemo(() => {
    const result: Record<string, Task[]> = {};

    columns.forEach((col) => {
      const config = sortConfigs[col.id] ?? DEFAULT_SORT;
      const colTasks = filteredTasks.filter((t) => t.status === col.id);

      result[col.id] = [...colTasks].sort((a, b) => {
        let cmp = 0;
        switch (config.key) {
          case "title":
            cmp = a.title.localeCompare(b.title);
            break;
          case "priority": {
            const w = { low: 1, medium: 2, high: 3 };
            cmp = w[a.priority] - w[b.priority];
            break;
          }
          case "dueDate":
          default: {
            const dA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            if (!a.dueDate && b.dueDate) cmp = 1;
            else if (a.dueDate && !b.dueDate) cmp = -1;
            else cmp = dA - dB;
            break;
          }
        }
        return config.direction === "asc" ? cmp : -cmp;
      });
    });

    return result;
  }, [columns, filteredTasks, sortConfigs]);

  const didFetch = useRef(false);
  useEffect(() => {
    if (status !== "authenticated" || didFetch.current) return;
    didFetch.current = true;
    getTasks().then((fetched) => dispatch(setTasks(fetched)));
  }, [status, dispatch]);

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("taskId", taskId);
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-card border border-card-border shadow-xl">
          <LogIn className="h-10 w-10 text-violet-500" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome to TaskNova
          </h2>
          <p className="text-muted-foreground">
            Please sign in with your Google account to access your personal task
            board.
          </p>
        </div>
        <button
          onClick={() => signIn("google")}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-foreground hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
        >
          <LogIn className="h-4 w-4" />
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {session?.user?.name
              ? `Welcome back, ${session.user.name.split(" ")[0]}`
              : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your tasks in one place.
          </p>
        </div>
      </div>

      <StatsCards tasks={allTasks} />

      <FilterBar />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {filteredTasks.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredTasks.length}
              </span>{" "}
              tasks
            </>
          ) : (
            <span className="text-slate-500">No tasks</span>
          )}
        </p>
        {(filters.search ||
          filters.status !== "all" ||
          filters.priority !== "all" ||
          filters.date) && (
          <button
            onClick={() =>
              dispatch(
                setFilters({
                  search: "",
                  status: "all",
                  priority: "all",
                  date: "",
                }),
              )
            }
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <button
        onClick={() => setShowAddColumn(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 px-4 py-2.5 text-sm font-medium text-slate-500 hover:border-violet-500 hover:text-violet-400 hover:bg-violet-950/20 transition-all"
      >
        <LayoutGrid className="h-4 w-4" />
        Add Column
      </button>

      <div
        className="grid gap-3 pb-2"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          minHeight: 300,
        }}
      >
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={tasksByColumn[col.id] ?? []}
            taskCount={allTasks.filter((t) => t.status === col.id).length}
            sortConfig={sortConfigs[col.id] ?? DEFAULT_SORT}
            isCustom={!BUILT_IN_IDS.has(col.id)}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {showAddColumn && (
        <AddColumnModal onClose={() => setShowAddColumn(false)} />
      )}
    </div>
  );
}
