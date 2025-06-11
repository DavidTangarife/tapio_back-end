import { Request, Response } from 'express';
import { createOpportunity } from '../services/opportunity.services';
import { ObjectId } from "bson"


export const createOpportunityController = async (req: Request, res: Response): Promise<any> => {
  const { projectId, statusId, title, company } = req.body;
   if (!projectId || !statusId || !title || !company?.name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const project = await createOpportunity({
      projectId: new ObjectId(String(projectId)),
      statusId: new ObjectId(String(statusId)),
      title,
      company
    });

    res.status(201).json(project);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};

