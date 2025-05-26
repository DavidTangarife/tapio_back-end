import Project, {IProject} from "../models/project.model"
import { Types } from "mongoose";

interface CreateProjectInput {
  userId: string;
  name: string;
  startDate: string;
  filters?: any
}
/* Create and return a new project */
export async function createProject(data: CreateProjectInput): Promise<IProject> {
  const project = await Project.create(data);
  return project;
}

/* Get projects belongs to a user by user's id */
export async function getProjectByUserId(userId: string) {
  return await Project.findByUserId(new Types.ObjectId(userId));
}

// export async function updateProjectFilters(projectId: string, filters: { keywords: string[]; senders: string[] }) {
//   const project = await Project.findById(projectId);
//   if (!projectId) throw new Error("Project not found");
//   return await project?.updateFilters(filters);
// }

/* Update all or some fields of a project */
export async function updateProject(
  projectId: string | Types.ObjectId,
  updates: {
    name?: string;
    startDate?: Date;
    filters?: { keywords: string[]; senders: string[] };
  }
) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  if (updates.name !== undefined) project.name = updates.name;
  if (updates.startDate !== undefined) project.startDate = updates.startDate;
  if (updates.filters !== undefined) project.filters = updates.filters;

  return await project.save();
}