import { Request, Response } from "express";
import { ObjectId } from "bson";
import {
  createStatus,
  getStatusesByProject,
} from "../services/status.services";
import { Types } from "mongoose";
import { getOpportunitiesByProject } from "../services/opportunity.services";
import Status from "../models/status.model"

export const createStatusController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { projectId, title, color } = req.body;
  if (!projectId || !title || !color) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const status = await createStatus({
      projectId: new Types.ObjectId(projectId),
      title: title.trim(),
      color,
    });

    res.status(201).json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to fetch Kanban board data for a project.
 * Retrieves all statuses (columns) and groups related opportunities (cards) under each status.
 * Expects a projectId query parameter.
 */
export const getKanbanController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid projectId in query params" });
  }
  const objectProjectId = new Types.ObjectId(projectId);

  try {
    const statuses = await getStatusesByProject(objectProjectId);
    const opportunities = await getOpportunitiesByProject(objectProjectId);

    // Group opportunities under their status
    const kanbanData = statuses.map((status) => {
      const statusOpportunities = opportunities.filter(
        (opp) =>
          (opp.statusId as Types.ObjectId).toString() ===
          (status._id as Types.ObjectId).toString()
      );

      return {
        ...status.toObject(),
        opportunities: statusOpportunities,
      };
    });

    res.status(200).json(kanbanData);
  } catch (err: any) {
    console.error("Error in getKanban:", err.message);
    res.status(500).json({ error: "Failed to load Kanban boards" });
  }
};

/**
 * Get the statuses for a project
 */
export const handleGetStatusesByProject = async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;

  try {
    const statuses = await Status.find({ projectId });
    return res.status(200).json(statuses);
  } catch (err) {
    console.error("Failed to fetch statuses", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
