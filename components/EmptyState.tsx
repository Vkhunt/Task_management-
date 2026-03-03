"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <ClipboardList className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">No tasks found</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-400">
        Looks like there are no tasks matching your filters. Create your first
        task to get started.
      </p>
      <Link
        href="/tasks/new"
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30"
      >
        Create Task
      </Link>
    </div>
  );
}
