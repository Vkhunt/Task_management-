"use server";

import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import type {
  Task as ITask,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/task";
import { getSession } from "@/lib/session";

export async function getTasks(): Promise<ITask[]> {
  try {
    const session = await getSession();
    if (!session?.user?.email) return [];

    await connectToDatabase();

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
      assignedTo: task.assignedTo || undefined,
      projectId: task.projectId || undefined,
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
    const session = await getSession();
    if (!session?.user?.email) return null;

    await connectToDatabase();

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
      assignedTo: task.assignedTo || undefined,
      projectId: task.projectId || undefined,
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
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    const newTask = await Task.create({
      ...data,
      userEmail: session.user.email,
    });

    return {
      id: newTask._id.toString(),
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      assignedTo: newTask.assignedTo || undefined,
      projectId: newTask.projectId || undefined,
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
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userEmail: session.user.email },
      data,
      { new: true },
    ).lean();

    if (!updatedTask) return null;

    return {
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate || undefined,
      assignedTo: updatedTask.assignedTo || undefined,
      projectId: updatedTask.projectId || undefined,
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
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    const result = await Task.findOneAndDelete({
      _id: id,
      userEmail: session.user.email,
    });

    if (result) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete task:", error);
    return false;
  }
}

export async function deleteTasksByStatus(status: string): Promise<number> {
  try {
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    const result = await Task.deleteMany({
      status,
      userEmail: session.user.email,
    });

    return result.deletedCount ?? 0;
  } catch (error) {
    console.error("Failed to delete tasks by status:", error);
    return 0;
  }
}

export async function moveTasksByStatus(
  fromStatus: string,
  toStatus: string,
): Promise<number> {
  try {
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    const result = await Task.updateMany(
      { status: fromStatus, userEmail: session.user.email },
      { status: toStatus },
    );

    return result.modifiedCount ?? 0;
  } catch (error) {
    console.error("Failed to move tasks by status:", error);
    return 0;
  }
}
