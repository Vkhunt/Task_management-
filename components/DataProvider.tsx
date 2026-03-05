"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTasks } from "@/store/features/tasksSlice";
import { setProjects } from "@/store/features/projectsSlice";
import { getTasks } from "@/app/actions/task.actions";
import { getProjects } from "@/app/actions/project.actions";

/**
 * Fetches tasks + projects ONCE immediately after the user authenticates.
 * All pages read from Redux and skip their own fetches when data is present.
 * Must be rendered inside AuthProvider + StoreProvider.
 */
export default function DataProvider() {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);

  const tasksLoaded = useAppSelector((s) => s.tasks.items.length > 0);
  const projectsLoaded = useAppSelector((s) => s.projects.items.length > 0);

  useEffect(() => {
    if (status !== "authenticated" || hasFetched.current) return;
    // If both slices already have data (e.g. from optimistic updates), skip
    if (tasksLoaded && projectsLoaded) return;

    hasFetched.current = true;

    Promise.all([getTasks(), getProjects()]).then(([tasks, projects]) => {
      dispatch(setTasks(tasks));
      dispatch(setProjects(projects));
    });
  }, [status, dispatch, tasksLoaded, projectsLoaded]);

  return null; // purely a side-effect component
}
