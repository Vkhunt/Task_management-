"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { taskSchema, type TaskFormValues } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectColumns } from "@/store/features/tasksSlice";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  isLoading?: boolean;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors";
const errorClass = "mt-1.5 text-xs text-red-400";
const labelClass = "block mb-1.5 text-sm font-medium text-slate-300";

export default function TaskForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Task",
}: TaskFormProps) {
  const columns = useAppSelector(selectColumns);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
        ...defaultValues,
      });
    }
  }, [JSON.stringify(defaultValues), reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>
          Title <span className="text-red-400">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="Enter task title..."
          className={cn(
            inputClass,
            errors.title &&
              "border-red-700 focus:border-red-500 focus:ring-red-500",
          )}
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe the task..."
          className={cn(
            inputClass,
            "resize-none",
            errors.description &&
              "border-red-700 focus:border-red-500 focus:ring-red-500",
          )}
        />
        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Assigned To (optional)</label>
        <input
          {...register("assignedTo")}
          placeholder="e.g. Alice, team-backend..."
          className={cn(
            inputClass,
            errors.assignedTo &&
              "border-red-700 focus:border-red-500 focus:ring-red-500",
          )}
        />
        {errors.assignedTo && (
          <p className={errorClass}>{errors.assignedTo.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Status <span className="text-red-400">*</span>
          </label>
          <select
            {...register("status")}
            className={cn(
              inputClass,
              "cursor-pointer appearance-none",
              errors.status && "border-red-700",
            )}
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className={errorClass}>{errors.status.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Priority <span className="text-red-400">*</span>
          </label>
          <select
            {...register("priority")}
            className={cn(
              inputClass,
              "cursor-pointer appearance-none",
              errors.priority && "border-red-700",
            )}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <p className={errorClass}>{errors.priority.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Due Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          {...register("dueDate")}
          className={cn(
            inputClass,
            "cursor-pointer",
            errors.dueDate &&
              "border-red-700 focus:border-red-500 focus:ring-red-500",
          )}
        />
        {errors.dueDate && (
          <p className={errorClass}>{errors.dueDate.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all",
          "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500",
          "shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {submitLabel}
      </button>
    </form>
  );
}
