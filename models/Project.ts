import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  color: string;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    color: { type: String, required: true, default: "violet" },
    userEmail: { type: String, required: true },
  },
  { timestamps: true },
);

ProjectSchema.index({ userEmail: 1, createdAt: -1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
