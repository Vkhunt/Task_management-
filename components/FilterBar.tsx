"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { TaskFilters } from "@/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setFilters, selectColumns } from "@/store/features/tasksSlice";

const EMPTY_FILTERS: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  date: "",
};

const priorityOptions = [
  { value: "all", label: "All Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export default function FilterBar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.tasks.filters);
  const columns = useAppSelector(selectColumns);

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.date;

  const selectClass =
    "rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-3 pr-8 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors appearance-none cursor-pointer";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) =>
            dispatch(setFilters({ ...filters, search: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="h-4 w-4 text-slate-500 shrink-0" />

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) =>
            dispatch(
              setFilters({
                ...filters,
                status: e.target.value as TaskFilters["status"],
              }),
            )
          }
          className={selectClass}
        >
          <option value="all">All Status</option>
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.label}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) =>
            dispatch(
              setFilters({
                ...filters,
                priority: e.target.value as TaskFilters["priority"],
              }),
            )
          }
          className={selectClass}
        >
          {priorityOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={filters.date || ""}
          onChange={(e) =>
            dispatch(setFilters({ ...filters, date: e.target.value }))
          }
          className="rounded-xl border border-slate-700 bg-slate-900 py-2 pl-3 pr-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
        />

        {/* Clear all — only visible when a filter is active */}
        {hasActiveFilters && (
          <button
            onClick={() => dispatch(setFilters(EMPTY_FILTERS))}
            title="Clear all filters"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:border-red-700 hover:bg-red-950 hover:text-red-300 transition-all"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
