import {Request, Response} from 'express';
import { createProject } from '../services/project.services';
import {ObjectId} from "bson"
import { Types } from 'mongoose';

export const createProjectController = async (req: Request, res: Response) => {
  const { userId, name, startDate, filters } = req.body;
  // console.log("Request body:", req.body);

  try {
    const project = await createProject({
      userId: new ObjectId(String(userId)),
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
