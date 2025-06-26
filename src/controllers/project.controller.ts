import { NextFunction, Request, Response } from "express";
import { getUserById, onboardUser } from "../services/user.services";
import {
  createProject,
  deleteProjectAndEmails,
  getProjectById,
  getProjectByUserId,
  updateLastSync,
  updateProject,
} from "../services/project.services";
import { getFilterableEmails } from "../services/email.services";


export const createProjectController = async (req: Request, res: Response) => {
  const { name, startDate, filters } = req.body;
  const userId = req.session.user_id;

  try {
    const project = await createProject({
      userId,
      name,
      startDate: new Date(startDate),
      filters,
    });
    // console.log("Request body:", req.body);
    req.session.project_id = project._id;
    req.session.save();
    await onboardUser(userId, req.session.project_id);

    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.session.user_id;
  const projectId = req.session.project_id;

  if (!projectId) {
    res.status(404).json({ error: "No Project Found" });
  }
  const emails = await getFilterableEmails(projectId);
  res.status(200).json({ emails });
};

export const handleGetProjectsByUserId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const projects = await getProjectByUserId(userId);
    if (!projects) {
      return res.status(404).json({ error: "No projects found" });
    }
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller to update the filters array of a specific project.
 *
 * Expects a project ID in the route parameters and a `filters` array in the request body.
 * Validates that the `filters` field is an array of strings before updating the project.
 *
 * @route PATCH /api/projects/:projectId/filters
 * @param req - Express request object containing projectId and filters
 * @param res - Express response object
 * @returns The updated project document or an appropriate error response
 */
export const updateProjectFilters = async (
  req: Request,
  res: Response
): Promise<any> => {
  const projectId = req.session.project_id;
  const { filters } = req.body;

  if (!Array.isArray(filters)) {
    return res
      .status(400)
      .json({ error: "Filters must be an array of strings." });
  }
  try {
    const updatedProject = await updateProject(projectId, { filters });
    return res.json(updatedProject);
  } catch (err: any) {
    console.error("Error updating project filters:", err);
    return res.status(500).json({ error: "Failed to update filters." });
  }
};

/**
 * Updates the user's active project in the session and in the database.
 * used in Header component in frontend
 *
 * @route PATCH /api/session-update
 * @param req - Express request object containing session and new projectId
 * @param res - Express response object used to return status
 * @returns a success response with the new project ID or an appropriate error message
 */
export async function updateSession(req: Request, res: Response): Promise<any> {
  const { projectId } = req.body;
  const userId = req.session.user_id;
  if (!projectId) {
    return res.status(400).json({ error: "Missing projectId" });
  }
  try {
    const user = await getUserById(userId);
    if (user) {
      user.lastProject = projectId;
      await user.save();
    }
    req.session.project_id = projectId;
    res.json({ success: true, projectId });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSessionProject(req: Request, res: Response): Promise<any> {
  const projectId = req.session.project_id;
  if (!projectId) {
    return res.status(400).json({ error: "Missing projectId" });
  }
  return res.status(200).json({ projectId });
}


/**
 * Controller to delete a project and its associated emails.
 * @route DELETE /api/projects
 */
export async function deleteProjectById(req: Request, res: Response): Promise<any> {
  const { projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ error: "Project ID is required." });
    return;
  }

  try {
    await deleteProjectAndEmails(projectId);
    res.status(200).json({ message: "Project and associated emails deleted successfully." });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project." });
  }
}