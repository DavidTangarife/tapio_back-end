import {Request, Response} from 'express';
import { createProject } from '../services/project.services';


export const createProjectController = async (req: Request, res: Response) => {
  const { userId, name, startDate, filters } = req.body;

  try {
    const project = await createProject({ userId, name, startDate, filters });
    res.status(201).json(project);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};
