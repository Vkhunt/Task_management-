"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Circle,
  Timer,
  ChevronDown,
  User,
} from "lucide-react";
import {
  formatDate,
  formatDateTime,
  isOverdue,
  cn,
  PRIORITY_LABELS,
} from "@/lib/utils";
import type { Task } from "@/types/task";
import { deleteTask, updateTask } from "@/app/actions/task.actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  selectColumns,
} from "@/store/features/tasksSlice";

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const statusConfig = {
  todo: {
    icon: Circle,
    className: "text-slate-400 bg-slate-800 border-slate-700",
    textClass: "text-slate-300",
  },
  "in-progress": {
    icon: Timer,
    className: "text-amber-400 bg-amber-950 border-amber-800",
    textClass: "text-amber-300",
  },
  done: {
    icon: CheckCircle2,
    className: "text-emerald-400 bg-emerald-950 border-emerald-800",
    textClass: "text-emerald-300",
  },
};

const priorityConfig = {
  low: { dot: "bg-sky-400", label: "text-sky-300" },
  medium: { dot: "bg-amber-400", label: "text-amber-300" },
  high: { dot: "bg-red-400", label: "text-red-300" },
};

const TaskCard = ({
  task,
  onDelete,
  onDragStart,
  onDragEnd,
}: TaskCardProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const columns = useAppSelector(selectColumns);
  const overdue = isOverdue(task.dueDate) && task.status !== "done";
  const sc = statusConfig[task.status as keyof typeof statusConfig] ?? {
    icon: Circle,
    className: "text-violet-400 bg-violet-950 border-violet-800",
    textClass: "text-violet-300",
  };
  const StatusIcon = sc.icon;
  const pc = priorityConfig[task.priority];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "status" | "priority" | null
  >(null);

  async function handleStatusUpdate(
    e: React.MouseEvent,
    newStatus: Task["status"],
  ) {
    e.stopPropagation();
    setOpenDropdown(null);
    if (task.status === newStatus) return;

    const optimisticTask = { ...task, status: newStatus };
    dispatch(updateTaskAction(optimisticTask));
    await updateTask(task.id, { status: newStatus });
  }

  async function handlePriorityUpdate(
    e: React.MouseEvent,
    newPriority: Task["priority"],
  ) {
    e.stopPropagation();
    setOpenDropdown(null);
    if (task.priority === newPriority) return;

    const optimisticTask = { ...task, priority: newPriority };
    dispatch(updateTaskAction(optimisticTask));
    await updateTask(task.id, { priority: newPriority });
  }

  function handleDragStart(e: React.DragEvent) {
    if (!onDragStart) return;
    onDragStart(e, task.id);
    setTimeout(() => setIsDragging(true), 0);
  }

  function handleDragEnd(e: React.DragEvent) {
    setIsDragging(false);
    onDragEnd?.(e);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }

  function confirmDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(deleteTaskAction(task.id));
    deleteTask(task.id);
    onDelete?.();
    setShowDeleteConfirm(false);
  }

  function cancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  }

  return (
    <div
      className={cn(
        "group block transition-all duration-300",
        isDragging && "opacity-40 scale-95",
        openDropdown !== null && "relative z-[60]",
      )}
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        onClick={() => router.push(`/tasks/${task.id}`)}
        className={cn(
          "relative rounded-xl border bg-slate-900 p-3 transition-all duration-200 cursor-pointer",
          "hover:border-violet-700 hover:shadow-md hover:shadow-violet-900/20 hover:-translate-y-0.5",
          overdue ? "border-red-800/70" : "border-slate-800",
          onDragStart && "cursor-grab active:cursor-grabbing",
          isDragging && "ring-2 ring-violet-500 shadow-2xl",
        )}
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="relative flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === "status" ? null : "status");
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold hover:brightness-110 transition-all max-w-full truncate",
                sc.className,
              )}
            >
              <StatusIcon className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">
                {columns.find((c) => c.id === task.status)?.label ??
                  task.status}
              </span>
              <ChevronDown
                className={cn(
                  "h-2.5 w-2.5 shrink-0 opacity-70 transition-transform",
                  openDropdown === "status" && "rotate-180",
                )}
              />
            </button>

            {openDropdown === "status" && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                  }}
                />
                <div
                  className="absolute top-full left-0 mt-1.5 w-36 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1 flex flex-col gap-0.5">
                    {columns.map((col) => {
                      const ColIcon = (
                        statusConfig[col.id as keyof typeof statusConfig] ??
                        statusConfig["todo"]
                      ).icon;
                      const colStyle = statusConfig[
                        col.id as keyof typeof statusConfig
                      ] ?? { icon: Circle, textClass: "text-violet-300" };
                      return (
                        <button
                          key={col.id}
                          onClick={(e) => handleStatusUpdate(e, col.id)}
                          className={cn(
                            "flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                            task.status === col.id
                              ? "bg-violet-600/20 text-violet-400"
                              : "text-slate-300 hover:bg-slate-800",
                          )}
                        >
                          <ColIcon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              colStyle.textClass,
                            )}
                          />
                          {col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(
                  openDropdown === "priority" ? null : "priority",
                );
              }}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors",
                pc.label,
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full shrink-0", pc.dot)}
              />
              {PRIORITY_LABELS[task.priority]}
              <ChevronDown
                className={cn(
                  "h-2.5 w-2.5 opacity-70 transition-transform",
                  openDropdown === "priority" && "rotate-180",
                )}
              />
            </button>

            {openDropdown === "priority" && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(null);
                  }}
                />
                <div
                  className="absolute top-full right-0 mt-1.5 w-28 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1 flex flex-col gap-0.5">
                    {(["low", "medium", "high"] as Task["priority"][]).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={(e) => handlePriorityUpdate(e, p)}
                          className={cn(
                            "flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                            task.priority === p
                              ? "bg-violet-600/20 text-violet-400"
                              : "text-slate-300 hover:bg-slate-800",
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              priorityConfig[p].dot,
                            )}
                          />
                          {PRIORITY_LABELS[p]}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleDeleteClick}
            className="shrink-0 rounded-lg p-1 text-slate-600 hover:bg-red-950 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <h3
          className={cn(
            "text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-violet-200 transition-colors mb-1.5",
            task.status === "done" && "line-through text-slate-400",
          )}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed mb-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-auto pt-1 border-t border-slate-800/60">
          {task.assignedTo && (
            <span className="flex items-center gap-1 text-slate-500 truncate max-w-[120px]">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{task.assignedTo}</span>
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1",
                overdue ? "text-red-400 font-medium" : "text-slate-500",
              )}
            >
              {overdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              {overdue ? "Overdue · " : ""}
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="h-3 w-3" />
            {formatDateTime(task.createdAt)}
          </span>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950 border border-red-900">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Task
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Are you sure you want to delete this task?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TaskCard);
