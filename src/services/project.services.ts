import Project, {IProject} from "../models/project.model"
import { Types } from "mongoose";
import Status from "../models/status.model"

interface CreateProjectInput {
  userId: Types.ObjectId;
  name: string;
  startDate: Date;
  filters?: any
}
/* Create and return a new project */
export async function createProject(data: CreateProjectInput): Promise<IProject> {
//  console.log("Inside createProject service, data:", data);
 const defaultStatuses = [
    { title: "To review", order: 1 },
    { title: "Applied", order: 2 },
    { title: "Interviewing", order: 3 },
    { title: "offer", order: 4 },
  ];

  try {
    const project = await Project.create(data);
    console.log("Project created successfully:", project);
    // create default status for the project in database
    await Promise.all(
      defaultStatuses.map((status) =>
        Status.create({ ...status, projectId: project._id })
      )
    );
    console.log("Default statuses created for project:", project._id);
    return project;
  } catch (error) {
    console.error("Error in createProject:", error);
    throw error;
  }
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
    blockedFilters?: { keywords: string[]; senders: string[] };
  }
) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  if (updates.name !== undefined) project.name = updates.name;
  if (updates.startDate !== undefined) project.startDate = updates.startDate;
  if (updates.filters !== undefined) project.filters = updates.filters;
  if (updates.blockedFilters !== undefined) project.blockedFilters = updates.blockedFilters;

  return await project.save();
}


/**
 * Updates the lastLogin field of a project by ID.
 * @param projectId The ID of the project to update.
 * @returns The updated project document.
 */
export async function updateLastLogin(projectId: string) {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { lastLogin: new Date() },
    { new: true }
  );
  return project;
}