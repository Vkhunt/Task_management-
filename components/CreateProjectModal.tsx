"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  { id: "violet", bg: "bg-violet-500", label: "Violet" },
  { id: "indigo", bg: "bg-indigo-500", label: "Indigo" },
  { id: "rose", bg: "bg-rose-500", label: "Rose" },
  { id: "amber", bg: "bg-amber-500", label: "Amber" },
  { id: "teal", bg: "bg-teal-500", label: "Teal" },
  { id: "sky", bg: "bg-sky-500", label: "Sky" },
];

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    color: string;
  }) => void;
  isLoading?: boolean;
}

export default function CreateProjectModal({
  onClose,
  onCreate,
  isLoading,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("violet");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    onCreate({ name: name.trim(), description: description.trim(), color });
  }

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-600/30">
              <FolderPlus className="h-4 w-4 text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-white">New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Website Redesign"
              className={cn(
                inputClass,
                error &&
                  "border-red-700 focus:border-red-500 focus:ring-red-500",
              )}
            />
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this project about?"
              className={cn(inputClass, "resize-none")}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    c.bg,
                    color === c.id
                      ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                      : "opacity-60 hover:opacity-100",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
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
              disabled={!name.trim() || isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
