import {Request, Response} from 'express';
import { createProject, updateLastLogin } from '../services/project.services';
import {ObjectId} from "bson"


export const createProjectController = async (req: Request, res: Response) => {
  const { name, startDate, filters } = req.body;
  const userId = req.session.user_id;
  // console.log(userId)
  // console.log("Request body:", req.body);

  try {
    const project = await createProject({
      userId,
      name,
      startDate: new Date(startDate),
      filters
    });
    // console.log("Request body:", req.body);

    res.status(201).json(project);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to handle updating a project's lastLogin timestamp.
 */
export const updateLastLoginController = async (req: Request, res: Response) : Promise<any> => {
  try {
    const projectId = req.params.projectId;
    const project = await updateLastLogin(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "lastLogin updated", project });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}