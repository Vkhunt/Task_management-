/**
 * "use server" is a special Next.js directive.
 * It tells Next.js that all the functions exported in this file are Server Actions.
 * Server Actions run ONLY on the backend server, never in the browser.
 * This means you can safely connect to databases or use secret API keys here
 * without exposing them to the user.
 */
"use server";

import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import type {
  Task as ITask,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/task";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Fetches all tasks from the MongoDB database.
 * @returns An array of tasks sorted from newest to oldest.
 */
export async function getTasks(): Promise<ITask[]> {
  try {
    /**
     * getServerSession runs on the server to securely get the logged-in user.
     * We pass config from authOptions to it.
     */
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    await connectToDatabase();

    // Only return tasks that belong to the logged-in user's email
    const tasks = await Task.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    return tasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })) as ITask[];
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function getTaskById(id: string): Promise<ITask | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    await connectToDatabase();

    // Ensure the task belongs to the user
    const task = await Task.findOne({
      _id: id,
      userEmail: session.user.email,
    }).lean();

    if (!task) return null;

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    } as ITask;
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return null;
  }
}

export async function createTask(data: CreateTaskInput): Promise<ITask | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    // Automatically inject the user's email into the new task
    const newTask = await Task.create({
      ...data,
      userEmail: session.user.email,
    });
    revalidatePath("/");

    return {
      id: newTask._id.toString(),
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
    } as ITask;
  } catch (error) {
    console.error("Failed to create task:", error);
    return null;
  }
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput,
): Promise<ITask | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    // Ensure we only update tasks owned by the current user
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userEmail: session.user.email },
      data,
      { returnDocument: "after" },
    ).lean();

    if (!updatedTask) return null;

    revalidatePath("/");
    revalidatePath(`/tasks/${id}`);

    return {
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate || undefined,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    } as ITask;
  } catch (error) {
    console.error("Failed to update task:", error);
    return null;
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    // Ensure we only delete tasks owned by the current user
    const result = await Task.findOneAndDelete({
      _id: id,
      userEmail: session.user.email,
    });

    if (result) {
      revalidatePath("/");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete task:", error);
    return false;
  }
}
