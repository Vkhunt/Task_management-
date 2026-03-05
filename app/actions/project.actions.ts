"use server";

import connectToDatabase from "@/lib/mongodb";
import ProjectModel from "@/models/Project";
import TaskModel from "@/models/Task";
import type { Project, CreateProjectInput } from "@/types/task";
import { getSession } from "@/lib/session";

export async function getProjects(): Promise<Project[]> {
  try {
    const session = await getSession();
    if (!session?.user?.email) return [];

    await connectToDatabase();

    const projects = await ProjectModel.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    return projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as Project[];
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function createProject(
  data: CreateProjectInput,
): Promise<Project | null> {
  try {
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    const project = await ProjectModel.create({
      ...data,
      userEmail: session.user.email,
    });

    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      color: project.color,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    } as Project;
  } catch (error) {
    console.error("Failed to create project:", error);
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await connectToDatabase();

    // Delete the project
    await ProjectModel.findOneAndDelete({
      _id: id,
      userEmail: session.user.email,
    });

    // Cascade: delete all tasks that belong to this project
    await TaskModel.deleteMany({
      projectId: id,
      userEmail: session.user.email,
    });

    return true;
  } catch (error) {
    console.error("Failed to delete project:", error);
    return false;
  }
}
