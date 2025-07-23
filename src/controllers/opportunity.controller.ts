import { NextFunction, Request, Response } from "express";
import {
  createOpportunity,
  getOpportunitiesByProject,
  updateOpportunityStatus,
  deleteOpportunity,
  updateOpportunity,
  getOpportunitiesByStatus,
  updatePositionOfOrder,
} from "../services/opportunity.services";
import { assignOpportunityToEmail } from "../services/email.services";
import { ObjectId } from "bson";
import { Types } from "mongoose";
import Email from "../models/email.model";
import { getStatusById } from "../services/status.services";

export const createOpportunityController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { statusId, title, company, emailId, domain } = req.body;
  const projectId = req.session.project_id;

  if (!projectId || !statusId || !title || !company?.name || !emailId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Creates the opportunity
    const status = await getStatusById(statusId);
    const opportunities = await getOpportunitiesByStatus(statusId);
    const position = opportunities.length;

    const opportunity = await createOpportunity({
      projectId: new ObjectId(String(projectId)),
      statusId: new ObjectId(String(statusId)),
      title,
      company,
      position,
    });

    if (domain) {
      await Email.updateMany(
        {
          projectId: projectId,
          from: {$regex: `<${domain}>$`, $options: "i" },
        }, // regex = Expression that matches the domain, options = i "case-insensitive"
        { $set: { opportunityId: opportunity._id } } // Set all the emails with that domain, this Opportunity ID
      );
    } else {
      // Fallback: Just assign the single email if no domain is provided
      await assignOpportunityToEmail(
        emailId,
        opportunity._id as Types.ObjectId
      );
    }

    res.status(201).json(opportunity);
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

// Controller that deletes Opportunity by ID
export const deleteOpportunityById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { opportunityId } = req.params;
  if (!opportunityId) {
    return res.status(400).json({ error: "Opportunity ID is required" });
  }

  try {
    const opportunityObjectId = new Types.ObjectId(opportunityId?.toString());
    const result = await deleteOpportunity(opportunityObjectId);

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error deleting the opportunity:", err.message);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
};

// Controller that Updates whole opportunity by ID

export const UpdateOpportunityById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { opportunityId } = req.params;
  const updatedData = req.body;

  if (!opportunityId || !updatedData) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const opportunityObjectId = new Types.ObjectId(opportunityId.toString());
    const updatedOpportunity = await updateOpportunity(
      opportunityObjectId,
      updatedData
    );
    res.status(200).json(updatedOpportunity);
  } catch (err: any) {
    console.error("Error updating opportunity:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateOpportunityOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = req.session.project_id;
  const data = req.body.data;
  console.log(data);
  data.updateOrder.forEach((element) => {
    const _id = element[0];
    const position = element[1];
    const status_id = element[2];
    updatePositionOfOrder(_id, position, status_id);
  });
  res.status(200).json({ message: "Success" });
};
