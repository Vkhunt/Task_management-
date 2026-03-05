"use client";

import { useState } from "react";
import { X, Plus, Columns } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addColumn, selectColumns } from "@/store/features/tasksSlice";
import { cn } from "@/lib/utils";

interface AddColumnModalProps {
  onClose: () => void;
}

function toColumnId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AddColumnModal({ onClose }: AddColumnModalProps) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(selectColumns);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Column name is required.");
      return;
    }

    const id = toColumnId(trimmed);
    if (!id) {
      setError("Column name must contain at least one letter or number.");
      return;
    }

    if (columns.some((c) => c.id === id)) {
      setError(`A column named "${trimmed}" already exists.`);
      return;
    }

    dispatch(addColumn({ id, label: trimmed }));
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-600/30">
              <Columns className="h-4 w-4 text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-white">New Column</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Column Name
            </label>
            <input
              type="text"
              autoFocus
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError("");
              }}
              placeholder="e.g. Review, Blocked…"
              className={cn(
                "w-full rounded-xl border bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors",
                error
                  ? "border-red-700 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:border-violet-500 focus:ring-violet-500",
              )}
            />
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          </div>

          {columns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">
                Existing columns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {columns.map((col) => (
                  <span
                    key={col.id}
                    className="inline-flex items-center rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs text-slate-300"
                  >
                    {col.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
