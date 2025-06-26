import Project, { IProject } from "../models/project.model"
import { Types } from "mongoose";
import Status from "../models/status.model"
import Email from "../models/email.model"
import Opportunity from "../models/opportunity.model";

interface CreateProjectInput {
  userId: Types.ObjectId;
  name: string;
  startDate: Date;
  filters?: any
}

/**
 * Creates a new project in the database and automatically initializes default statuses.
 *
 * The default statuses include: "To review", "Applied", "Interviewing", and "Offer",
 * each assigned a specific display order.
 *
 * @param data - The input data required to create a new project.
 * @returns The newly created project document.
 * @throws An error if project creation or status initialization fails.
 */
export async function createProject(data: CreateProjectInput): Promise<IProject> {
  const defaultStatuses = [
    { title: "To review", order: 1 },
    { title: "Applied", order: 2 },
    { title: "Interviewing", order: 3 },
    { title: "offer", order: 4 },
  ];

  try {
    const project = await Project.create(data);
    console.log("Project created successfully:", project);
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

/* Get project from id */
export async function getProjectById(_id: string): Promise<IProject | null> {
  return await Project.findOne({ _id });
};


/**
 * Updates one or more fields of a project document by its ID.
 * Fields that are not included in the `updates` object will remain unchanged.
 *
 * @param projectId - The ID of the project to update.
 * @param updates - An object containing any combination of fields to update: name, startDate, and/or filters.
 * @returns The updated project document.
 * @throws Error if the project is not found in the database.
 */
export async function updateProject(
  projectId: string | Types.ObjectId,
  updates: {
    name?: string;
    startDate?: Date;
    filters?: string[];
  }
) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  if (updates.name !== undefined) project.name = updates.name;
  if (updates.startDate !== undefined) project.startDate = updates.startDate;
  if (updates.filters !== undefined) project.filters = updates.filters;

  return await project.save();
}


/**
 * Updates the lastEmailSync field of a project by ID.
 * 
 * @param projectId The ID of the project to update.
 * @returns The updated project document.
 */
export async function updateLastSync(projectId: string) {
  try{
    const project = await Project.findById(projectId)
    if (project){
      project.lastEmailSync = new Date();
      await project?.save()
      return project;
    }
  } catch (err) {
    console.error("Error in updating last sync:", err);
  }
 
}

/**
 * Deletes a project and all associated emails and opportunities.
 * 
 * @param projectId - The ID of the project to delete.
 */
export async function deleteProjectAndEmails(projectId: Types.ObjectId | string) {
  await Email.deleteMany({ projectId });
  await Opportunity.deleteMany({ projectId });
  await Project.findByIdAndDelete(projectId);
}