"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/app/actions/task.actions";
import {
  formatDate,
  formatDateTime,
  isOverdue,
  cn,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/lib/utils";
import type { Task } from "@/types/task";
import type { TaskFormValues } from "@/lib/validations";
import TaskForm from "@/components/TaskForm";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  todo: {
    icon: Circle,
    className: "text-slate-400 bg-slate-800 border-slate-700",
  },
  "in-progress": {
    icon: Timer,
    className: "text-amber-400 bg-amber-950 border-amber-800",
  },
  done: {
    icon: CheckCircle2,
    className: "text-emerald-400 bg-emerald-950 border-emerald-800",
  },
};

const priorityConfig = {
  low: { dot: "bg-sky-400", label: "text-sky-300" },
  medium: { dot: "bg-amber-400", label: "text-amber-300" },
  high: { dot: "bg-red-400", label: "text-red-300" },
};

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null | undefined>(undefined);
  const [id, setId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id);
      const found = await getTaskById(id);
      setTask(found);
    });
  }, [params]);

  async function handleSubmit(values: TaskFormValues) {
    updateTask(id, {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
    });
    router.push("/");
  }

  function handleDeleteClick() {
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    deleteTask(id);
    router.push("/");
  }

  function cancelDelete() {
    setShowDeleteConfirm(false);
  }

  // Loading
  if (task === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Not found
  if (task === null) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">
            Task Not Found
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            This task does not exist or may have been deleted.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const sc = statusConfig[task.status] ?? {
    icon: Circle,
    className: "text-violet-400 bg-violet-950 border-violet-800",
  };
  const StatusIcon = sc.icon;
  const pc = priorityConfig[task.priority];
  const overdue = isOverdue(task.dueDate) && task.status !== "done";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back + Delete */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <button
          onClick={handleDeleteClick}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Task
        </button>
      </div>

      {/* Task meta */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                sc.className,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {STATUS_LABELS[task.status]}
            </span>
            <h1 className="text-xl font-bold text-white leading-snug">
              {task.title}
            </h1>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              pc.label,
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", pc.dot)} />
            {PRIORITY_LABELS[task.priority]} Priority
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1.5",
                overdue && "text-red-400 font-medium",
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {overdue ? "Overdue · " : "Due: "}
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Created: {formatDateTime(task.createdAt)}
          </span>
          {task.updatedAt !== task.createdAt && (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Updated: {formatDateTime(task.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit Task</h2>
        </div>
        <TaskForm
          key={task.updatedAt}
          defaultValues={{
            title: task.title,
            description: task.description,
            status: task.status as "todo" | "in-progress" | "done",
            priority: task.priority,
            dueDate: task.dueDate ?? "",
          }}
          onSubmit={handleSubmit}
          isLoading={false}
          submitLabel="Update Task"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950 border border-red-900">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Task
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-4">
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
}
