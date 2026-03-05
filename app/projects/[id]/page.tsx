"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  ArrowLeft,
  LayoutGrid,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTasks,
  selectFilteredTasks,
  selectColumns,
} from "@/store/features/tasksSlice";
import type { ColumnSort } from "@/store/features/tasksSlice";
import { setProjects, removeProject } from "@/store/features/projectsSlice";
import { getTasks } from "@/app/actions/task.actions";
import { getProjects, deleteProject } from "@/app/actions/project.actions";
import KanbanColumn from "@/components/BoardColumn";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import AddColumnModal from "@/components/AddColumnModal";
import { BUILT_IN_COLUMNS } from "@/types/task";
import type { Task as ITask } from "@/types/task";

const BUILT_IN_IDS = new Set(BUILT_IN_COLUMNS.map((c) => c.id));
const DEFAULT_SORT: ColumnSort = { key: "dueDate", direction: "asc" };

interface ProjectBoardProps {
  params: Promise<{ id: string }>;
}

export default function ProjectBoardPage({ params }: ProjectBoardProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { status } = useSession();
  const dispatch = useAppDispatch();

  const columns = useAppSelector(selectColumns);
  const sortConfigs = useAppSelector((state) => state.tasks.sortConfig);
  const allTasks: ITask[] = useAppSelector((state) => state.tasks.items);
  const filteredTasks: ITask[] = useAppSelector(selectFilteredTasks);
  const projects = useAppSelector((state) => state.projects.items);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = useMemo(
    () => filteredTasks.filter((t) => t.projectId === projectId),
    [filteredTasks, projectId],
  );
  const projectAllTasks = useMemo(
    () => allTasks.filter((t) => t.projectId === projectId),
    [allTasks, projectId],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    // If the store already has data (e.g. from an optimistic update after
    // creating a task), skip the re-fetch so the new task renders immediately.
    if (allTasks.length > 0 && projects.length > 0) {
      return;
    }
    // First load — fetch from DB
    setIsLoading(true);
    Promise.all([getTasks(), getProjects()]).then(([tasks, projs]) => {
      dispatch(setTasks(tasks));
      dispatch(setProjects(projs));
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const tasksByColumn = useMemo(() => {
    const result: Record<string, ITask[]> = {};
    columns.forEach((col) => {
      const config = sortConfigs[col.id] ?? DEFAULT_SORT;
      const colTasks = projectTasks.filter((t) => t.status === col.id);
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
            cmp = dA - dB;
            break;
          }
        }
        return config.direction === "asc" ? cmp : -cmp;
      });
    });
    return result;
  }, [columns, projectTasks, sortConfigs]);

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("taskId", taskId);
  }

  async function confirmDeleteProject() {
    dispatch(removeProject(projectId));
    await deleteProject(projectId);
    router.push("/projects");
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Back + Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {project?.name ?? "Project Board"}
          </h1>
          {project?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {project.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Project
        </button>
      </div>

      {/* Stats (for this project only) */}
      <StatsCards tasks={projectAllTasks} />

      {/* Filters */}
      <FilterBar />

      {/* Task count */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {projectTasks.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {projectTasks.length}
              </span>{" "}
              tasks
            </>
          ) : (
            <span className="text-slate-500">No tasks</span>
          )}
        </p>
      </div>

      {/* Add Column */}
      <button
        onClick={() => setShowAddColumn(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 px-4 py-2.5 text-sm font-medium text-slate-500 hover:border-violet-500 hover:text-violet-400 hover:bg-violet-950/20 transition-all"
      >
        <LayoutGrid className="h-4 w-4" />
        Add Column
      </button>

      {/* Kanban board */}
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
            taskCount={
              projectAllTasks.filter((t) => t.status === col.id).length
            }
            sortConfig={sortConfigs[col.id] ?? DEFAULT_SORT}
            isCustom={!BUILT_IN_IDS.has(col.id)}
            onDragStart={handleDragStart}
            projectId={projectId}
          />
        ))}
      </div>

      {showAddColumn && (
        <AddColumnModal onClose={() => setShowAddColumn(false)} />
      )}

      {/* Delete project confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950 border border-red-900">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Project
                </h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Delete{" "}
                  <span className="font-medium text-white">
                    &ldquo;{project?.name}&rdquo;
                  </span>
                  ? Tasks inside will remain in your Dashboard.
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
                onClick={confirmDeleteProject}
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
