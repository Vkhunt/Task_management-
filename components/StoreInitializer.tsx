"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setTasks } from "@/store/features/tasksSlice";
import { setProjects } from "@/store/features/projectsSlice";
import type { Task, Project } from "@/types/task";

interface StoreInitializerProps {
  tasks: Task[];
  projects: Project[];
}

/**
 * Hydrates Redux with server-fetched data instantly upon app load.
 * No client-side loaders needed — UI renders directly with data.
 */
export default function StoreInitializer({
  tasks,
  projects,
}: StoreInitializerProps) {
  const dispatch = useAppDispatch();

  // Lazy initialization runs exactly once during the first render
  useState(() => {
    dispatch(setTasks(tasks));
    dispatch(setProjects(projects));
  });

  return null;
}
