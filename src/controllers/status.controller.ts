import { NextFunction, Request, Response } from "express";
import { ObjectId } from "bson";
import {
  createStatus,
  deleteStatusById,
  getStatusesByProject,
  updateStatusOrder,
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
  const user = req.session.user_id
  const projectId = req.session.project_id;

  console.log(projectId)
  console.log(req.session)
  if (!user) {
    res.redirect('http://localhost:5173/')
  }
  if (!projectId) {
    return res
      .status(400)
      .json({ error: "Missing or invalid projectId in query params" });
  }

  try {
    const statuses = await getStatusesByProject(projectId);
    const opportunities = await getOpportunitiesByProject(projectId);

    console.log(opportunities)
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

    console.log(kanbanData)
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
  const projectId = req.session.project_id;

  try {
    const statuses = await Status.find({ projectId });
    return res.status(200).json(statuses);
  } catch (err) {
    console.error("Failed to fetch statuses", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStatusColumnName = async (req: Request, res: Response, next: NextFunction) => {
  const projectId = req.session.project_id;
  try {
    const status = await Status.findOne({ _id: req.body.id })
    if (status) {
      status.title = req.body.name
      status.save()
      res.status(200).send()
    } else {
      res.status(404).json({ error: "Project Status not found!" })
    }
  } catch (error) {
    console.log(error)
  }
}

export const newStatusColumn = async (req: Request, res: Response, next: NextFunction) => {
  const projectId = req.session.project_id;
  const { title, order } = req.body
  try {
    const status = await createStatus({ projectId, title, order })
    console.log('Created Status')
    console.log(status)
    res.status(200).json({ message: 'Created Status', status: status })
  } catch (err) {
    next(err)
  }
}

export const updateColumnOrder = async (req: Request, res: Response, next: NextFunction) => {
  const projectId = req.session.project_id;
  const data = req.body.data
  data.forEach((element) => {
    const _id = element[0]
    const order = element[1]
    updateStatusOrder(_id, order)
  })
  res.status(200).json({ message: 'Success' })
}

export const deleteStatus = async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.body._id
  deleteStatusById(_id)
  res.status(200).json({ message: 'Success' })
}
