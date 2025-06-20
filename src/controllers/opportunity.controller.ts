import { Request, Response } from "express";
import {
  createOpportunity,
  getOpportunitiesByProject,
  updateOpportunityStatus,
} from "../services/opportunity.services";
import { ObjectId } from "bson";
import { Types } from "mongoose";

export const createOpportunityController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { statusId, title, company } = req.body;
  const projectId = req.session.project_id
  if (!projectId || !statusId || !title || !company?.name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const project = await createOpportunity({
      projectId: new ObjectId(String(projectId)),
      statusId: new ObjectId(String(statusId)),
      title,
      company,
    });

    res.status(201).json(project);
  } catch (err: any) {
    console.error("Error creating the opportunity:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// THIS CAN BE DELETED IF THERE IS NO NEED BECAUSE WE GET ALL FROM THE KANBAN
export const getOpportunitiesByProjectController = async (
  req: Request,
  res: Response
) => {
  const { projectId } = req.query;
  const objectProjectId = new Types.ObjectId(projectId?.toString());

  try {
    const opportunities = await getOpportunitiesByProject(objectProjectId);
    res.status(200).json(opportunities);
  } catch (err: any) {
    console.error("Error fetching the opportunities:", err.message);
    res.status(500).json({ error: "Fail, Internal Server error" });
  }
};

// Update the opportunity state by id
export const updateOpportunityStateController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { opportunityId } = req.params;
  const { statusId } = req.body;

  if (!opportunityId || !statusId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const opportunityObjectId = new Types.ObjectId(opportunityId?.toString());
  const statusObjectId = new Types.ObjectId(statusId?.toString());

  try {
    const updateOpportunity = await updateOpportunityStatus(
      opportunityObjectId,
      statusObjectId
    );
    res.status(200).json(updateOpportunity);
  } catch (err: any) {
    console.error("Error updating the the opportunity:", err.message);
    res.status(500).json({ error: "Fail, Internal Server error" });
  }
};
