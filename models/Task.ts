import mongoose, { Schema, Document } from "mongoose";
import type { TaskStatus, TaskPriority } from "@/types/task";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    userEmail: { type: String, required: true },
    status: {
      type: String,
      default: "todo",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    dueDate: { type: String, required: false },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Compound index: fast per-user task list queries (used by getTasks)
TaskSchema.index({ userEmail: 1, createdAt: -1 });
// Compound index: fast single-task lookups (used by getTaskById)
TaskSchema.index({ _id: 1, userEmail: 1 });

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
