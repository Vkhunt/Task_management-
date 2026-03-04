"use client";

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import TaskCard from "@/components/TaskCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSortConfig,
  removeColumn,
  removeTasksByStatus,
  updateTask as updateTaskAction,
} from "@/store/features/tasksSlice";
import type { SortKey, ColumnSort } from "@/store/features/tasksSlice";

interface KanbanColumnProps {
  id: string;
  label: string;
  tasks: Task[];
  taskCount: number; // full count before filtering (for badge)
  sortConfig: ColumnSort;
  isCustom: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const SORT_KEYS: SortKey[] = ["dueDate", "priority", "title"];

const KanbanColumnInner = ({
  id,
  label,
  tasks,
  taskCount,
  sortConfig,
  isCustom,
  onDragStart,
}: KanbanColumnProps) => {
  const dispatch = useAppDispatch();
  // Read ALL tasks so we can find a dragged task from any column
  const allTasks = useAppSelector((state) => state.tasks.items);

  // Each column tracks its own drag-over state independently
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only fire if we're leaving the column root (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const taskId = e.dataTransfer.getData("taskId");
      if (!taskId) return;

      // Look up in ALL tasks, not just this column's tasks
      const taskToMove = allTasks.find((t) => t.id === taskId);

      // No-op if already in this column
      if (!taskToMove || taskToMove.status === id) return;

      // Instant optimistic update in Redux
      dispatch(updateTaskAction({ ...taskToMove, status: id }));

      // Background server sync
      const { updateTask } = await import("@/app/actions/task.actions");
      await updateTask(taskId, { status: id });
    },
    [allTasks, id, dispatch],
  );

  const handleColumnDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      setIsDragging(true);
      onDragStart(e, taskId);
    },
    [onDragStart],
  );

  const handleColumnDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleSortDirection = useCallback(() => {
    dispatch(
      setSortConfig({
        column: id,
        config: {
          ...sortConfig,
          direction: sortConfig.direction === "asc" ? "desc" : "asc",
        },
      }),
    );
  }, [dispatch, id, sortConfig]);

  const handleSortKey = useCallback(
    (key: SortKey) => {
      dispatch(setSortConfig({ column: id, config: { ...sortConfig, key } }));
      setOpenSort(false);
    },
    [dispatch, id, sortConfig],
  );

  const handleRemove = useCallback(() => {
    setShowRemoveConfirm(true);
  }, []);

  const confirmRemove = useCallback(() => {
    // 1. Optimistically clear all tasks in this column from the UI
    dispatch(removeTasksByStatus(id));
    // 2. Remove the column itself from the UI
    dispatch(removeColumn(id));
    setShowRemoveConfirm(false);
    // 3. Background DB sync — permanently delete tasks from MongoDB
    import("@/app/actions/task.actions").then(({ deleteTasksByStatus }) => {
      deleteTasksByStatus(id);
    });
  }, [dispatch, id]);

  const cancelRemove = useCallback(() => {
    setShowRemoveConfirm(false);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-2xl bg-muted/30 p-3 border w-full min-h-[280px] transition-all duration-300",
        isDragOver
          ? "border-violet-500 border-dashed border-2 bg-violet-950/20 scale-[1.02] shadow-inner"
          : "border-card-border",
        isDragging && "ring-1 ring-violet-500/30",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">
            {label}
          </h2>
          <span className="text-xs font-medium text-slate-500 bg-card/50 px-2 py-0.5 rounded-full ring-1 ring-slate-800">
            {taskCount}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sort Controls */}
          <div className="relative flex items-center">
            <div className="flex bg-muted/50 hover:bg-muted rounded-lg transition-all">
              <button
                onClick={() => setOpenSort((o) => !o)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all border-r border-slate-700/50"
              >
                <span className="capitalize">
                  {sortConfig.key === "dueDate" ? "Due Date" : sortConfig.key}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    openSort && "rotate-180",
                  )}
                />
              </button>
              <button
                onClick={toggleSortDirection}
                className="px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-violet-600/20 rounded-r-lg transition-colors flex items-center justify-center"
                title={
                  sortConfig.direction === "asc" ? "Ascending" : "Descending"
                }
              >
                {sortConfig.direction === "asc" ? (
                  <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {openSort && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenSort(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-slate-700 bg-card shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-1 flex flex-col gap-0.5">
                    {SORT_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSortKey(key)}
                        className={cn(
                          "flex items-center w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          sortConfig.key === key
                            ? "bg-violet-600/20 text-violet-400"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <span className="capitalize">
                          {key === "dueDate" ? "Due Date" : key}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Remove button — only for custom columns */}
          {isCustom && (
            <button
              onClick={handleRemove}
              title="Remove column"
              className="rounded-lg p-1 text-slate-600 hover:bg-red-950 hover:text-red-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Add Task Link */}
      <Link
        href={`/tasks/new?status=${id}`}
        className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-700/60 bg-card/20 px-3 py-2 text-xs font-medium text-muted-foreground hover:border-violet-500 hover:text-violet-400 hover:bg-violet-950/20 hover:shadow-sm transition-all"
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        Add Task
      </Link>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={handleColumnDragStart}
            onDragEnd={handleColumnDragEnd}
          />
        ))}
        {tasks.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center py-10 rounded-xl border-2 border-dashed transition-colors",
              isDragOver
                ? "border-violet-500/60 text-violet-400"
                : "border-slate-800 text-slate-700",
            )}
          >
            <p className="text-xs font-medium">Drop tasks here</p>
          </div>
        )}
      </div>
      {/* Remove Column Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950 border border-red-900">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Remove Column
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Remove{" "}
                  <span className="font-medium text-white">
                    &ldquo;{label}&rdquo;
                  </span>
                  
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelRemove}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KanbanColumn = memo(KanbanColumnInner);
export default KanbanColumn;
