"use client";

import { useState } from "react";
import { RefreshCw, FolderPlus, Folder, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addProject, removeProject } from "@/store/features/projectsSlice";
import { removeTasksByProjectId } from "@/store/features/tasksSlice";
import { createProject, deleteProject } from "@/app/actions/project.actions";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";
import type { CreateProjectInput, Project } from "@/types/task";

export default function ProjectsPage() {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.items);
  const allTasks = useAppSelector((state) => state.tasks.items);

  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate(data: CreateProjectInput) {
    setIsCreating(true);
    const project = await createProject(data);
    if (project) dispatch(addProject(project));
    setIsCreating(false);
    setShowCreate(false);
  }

  // Step 1: open confirm popup
  function handleDeleteClick(id: string) {
    const project = projects.find((p) => p.id === id);
    if (project) setProjectToDelete(project);
  }

  // Step 2: confirmed — remove from store + DB
  async function confirmDelete() {
    if (!projectToDelete) return;
    setIsDeleting(true);

    const id = projectToDelete.id;
    // Optimistic: remove project + all its tasks from Redux immediately
    dispatch(removeProject(id));
    dispatch(removeTasksByProjectId(id));
    setProjectToDelete(null);
    setIsDeleting(false);

    // Background DB delete (cascades tasks too on the server)
    await deleteProject(id);
  }

  const taskCountForProject = (id: string) =>
    allTasks.filter((t) => t.projectId === id).length;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organise your tasks into dedicated project boards.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
        >
          <FolderPlus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-800 text-center">
          <Folder className="h-12 w-12 text-slate-700 mb-4" />
          <p className="text-base font-semibold text-slate-500 mb-1">
            No projects yet
          </p>
          <p className="text-sm text-slate-600 mb-6">
            Create your first project to get started.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all"
          >
            <FolderPlus className="h-4 w-4" />
            New Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={allTasks}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          isLoading={isCreating}
        />
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Icon + Title */}
            <div className="flex items-start gap-4 mb-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-950 border border-red-900">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Delete Project
                </h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  Delete{" "}
                  <span className="font-semibold text-white">
                    &ldquo;{projectToDelete.name}&rdquo;
                  </span>
                  ?{" "}
                  {taskCountForProject(projectToDelete.id) > 0 ? (
                    <>
                      This will permanently delete{" "}
                      <span className="font-semibold text-red-400">
                        {taskCountForProject(projectToDelete.id)} task
                        {taskCountForProject(projectToDelete.id) !== 1
                          ? "s"
                          : ""}
                      </span>{" "}
                      inside it.
                    </>
                  ) : (
                    "This project has no tasks."
                  )}
                </p>
              </div>
            </div>

            {/* Warning note */}
            {taskCountForProject(projectToDelete.id) > 0 && (
              <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3">
                <p className="text-xs text-red-300 font-medium">
                  ⚠ This action cannot be undone. All tasks in this project will
                  be permanently deleted.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
