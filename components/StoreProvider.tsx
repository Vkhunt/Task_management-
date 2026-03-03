"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useSession } from "next-auth/react";
import { setAuthSession, clearAuthSession } from "@/store/features/authSlice";
import { setColumns } from "@/store/features/tasksSlice";
import type { KanbanColumn } from "@/store/features/tasksSlice";

const COLUMNS_STORAGE_KEY = "taskflow_custom_columns";

function AuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      store.dispatch(
        setAuthSession({
          isAuthenticated: true,
          user: session.user,
        }),
      );
    } else if (status === "unauthenticated") {
      store.dispatch(clearAuthSession());
    }
  }, [session, status]);

  return null;
}

function ColumnsSync() {
  useEffect(() => {
    // Restore custom columns from localStorage on mount
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed: KanbanColumn[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          store.dispatch(setColumns(parsed));
        }
      }
    } catch {
      // ignore parse errors
    }

    // Subscribe to store changes and persist columns when they change
    const unsubscribe = store.subscribe(() => {
      const columns = store.getState().tasks.columns;
      try {
        localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columns));
      } catch {
        // ignore storage errors
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeInstance] = useState(() => store);

  return (
    <Provider store={storeInstance}>
      <AuthSync />
      <ColumnsSync />
      {children}
    </Provider>
  );
}
