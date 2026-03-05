"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createTask } from "@/app/actions/task.actions";
import type { TaskFormValues } from "@/lib/validations";
import TaskForm from "@/components/TaskForm";
import { Suspense, useState } from "react";
import type { TaskStatus } from "@/types/task";
import { useAppDispatch } from "@/store/hooks";
import { addTask, replaceTask } from "@/store/features/tasksSlice";

function NewTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusParam = searchParams.get("status") as TaskStatus | null;
  const defaultStatus: TaskStatus =
    statusParam && statusParam.trim().length > 0 ? statusParam : "todo";

  async function handleSubmit(values: TaskFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const tempId = `temp-${Date.now()}`;

    const optimisticTask = {
      id: tempId,
      title: values.title,
      description: values.description || "",
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      assignedTo: values.assignedTo || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addTask(optimisticTask));

    router.push("/");

    createTask({
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      assignedTo: values.assignedTo || undefined,
    }).then((realTask) => {
      if (realTask) {
        dispatch(replaceTask({ oldId: tempId, newTask: realTask }));
      }
    });
  }

  return (
    <TaskForm
      defaultValues={{ status: defaultStatus }}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitLabel="Create Task"
    />
  );
}

export default function NewTaskPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create New Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below to add a new task to your board.
        </p>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-8">
        <Suspense
          fallback={<div className="h-64 animate-pulse bg-muted rounded-xl" />}
        >
          <NewTaskForm />
        </Suspense>
      </div>
    </div>
  );
}
