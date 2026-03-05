"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  User,
  Pencil,
  X,
  Folder,
} from "lucide-react";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/app/actions/task.actions";
import { getProjects } from "@/app/actions/project.actions";
import {
  formatDate,
  formatDateTime,
  isOverdue,
  cn,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/lib/utils";
import type { Task, Project } from "@/types/task";
import type { TaskFormValues } from "@/lib/validations";
import TaskForm from "@/components/TaskForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
} from "@/store/features/tasksSlice";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; className: string }
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

const PROJECT_COLORS: Record<string, string> = {
  violet: "text-violet-400 bg-violet-950/50 border-violet-800/50",
  indigo: "text-indigo-400 bg-indigo-950/50 border-indigo-800/50",
  rose: "text-rose-400 bg-rose-950/50 border-rose-800/50",
  amber: "text-amber-400 bg-amber-950/50 border-amber-800/50",
  teal: "text-teal-400 bg-teal-950/50 border-teal-800/50",
  sky: "text-sky-400 bg-sky-950/50 border-sky-800/50",
};

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = use(params);
  const searchParams = useSearchParams();
  const fromDashboard = searchParams.get("from") === "dashboard";

  const taskFromStore = useAppSelector((state) =>
    state.tasks.items.find((t) => t.id === id),
  );

  // Only used when task is not in the Redux store (direct URL access)
  const [fetchedTask, setFetchedTask] = useState<Task | null | undefined>(
    taskFromStore ? undefined : undefined, // start undefined = loading
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derive task: prefer live store value, fall back to DB fetch
  const task: Task | null | undefined = taskFromStore ?? fetchedTask;

  // If task not in store, fetch from DB
  useEffect(() => {
    if (!taskFromStore) {
      getTaskById(id).then((found) => setFetchedTask(found ?? null));
    }
    getProjects().then((projs) => setProjects(projs));
  }, [id, taskFromStore]);

  async function handleSubmit(values: TaskFormValues) {
    if (!task) return;
    setIsSaving(true);

    const updatedTask: Task = {
      ...task,
      title: values.title,
      description: values.description || "",
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate,
      assignedTo: values.assignedTo || undefined,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update — task is derived from store so this auto-reflects
    dispatch(updateTaskAction(updatedTask));
    setIsEditing(false);
    setIsSaving(false);

    // Background persistence
    updateTask(id, {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate,
      assignedTo: values.assignedTo || undefined,
    });
  }

  function confirmDelete() {
    dispatch(deleteTaskAction(id));
    // If opened from dashboard, always go back to dashboard
    if (fromDashboard) {
      router.push("/");
    } else if (task?.projectId) {
      router.push(`/projects/${task.projectId}`);
    } else {
      router.push("/");
    }
    deleteTask(id);
  }

  /* ─── Loading skeleton ─── */
  if (task === undefined) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded-full" />
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="h-5 w-20 bg-slate-800 rounded-full" />
          <div className="h-7 w-3/4 bg-slate-800 rounded-lg" />
          <div className="flex gap-4">
            <div className="h-4 w-28 bg-slate-800 rounded-full" />
            <div className="h-4 w-28 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Not found ─── */
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
  const project = projects.find((p) => p.id === task.projectId);
  const projectColor = project
    ? (PROJECT_COLORS[project.color] ?? PROJECT_COLORS.violet)
    : "";

  const backHref = fromDashboard
    ? "/"
    : task.projectId
      ? `/projects/${task.projectId}`
      : "/";
  const backLabel = fromDashboard
    ? "Back to Dashboard"
    : task.projectId
      ? "Back to Project"
      : "Back to Dashboard";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:border-violet-600 hover:text-violet-300 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Task detail card (always visible) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        {/* Status + priority row */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                sc.className,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
            {project && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  projectColor,
                )}
              >
                <Folder className="h-3 w-3" />
                {project.name}
              </span>
            )}
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

        {/* Title */}
        <h1 className="text-xl font-bold text-white leading-snug mb-4">
          {task.title}
        </h1>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-400 leading-relaxed mb-5 whitespace-pre-wrap">
            {task.description}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-800 pt-4">
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
          {task.assignedTo && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <User className="h-3.5 w-3.5" />
              {task.assignedTo}
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

      {/* Edit form — only shown when isEditing */}
      {isEditing && (
        <div className="rounded-2xl border border-violet-800/40 bg-slate-900 p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Edit Task</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <TaskForm
            key={task.id}
            defaultValues={{
              title: task.title,
              description: task.description,
              status: task.status as "todo" | "in-progress" | "done",
              priority: task.priority,
              dueDate: task.dueDate ?? "",
              assignedTo: task.assignedTo ?? "",
            }}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            submitLabel="Save Changes"
          />
        </div>
      )}

      {/* Delete confirm modal */}
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
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-white">
                    &ldquo;{task.title}&rdquo;
                  </span>
                  ?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
