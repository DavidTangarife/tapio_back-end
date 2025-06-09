import Opportunity from "../models/opportunity.model";
import { Types } from "mongoose";

interface CreateOpportunityInput {
  projectId: Types.ObjectId;
  statusId: Types.ObjectId;
  title: string;
  company: {
    name: string;
  };
}

/* Create and return a new project */
export async function createOpportunity(data: CreateOpportunityInput) {
  try {
    const opportunity = await Opportunity.create(data);
    console.log("Opportunity created successfully:", opportunity);
    return opportunity;
  } catch (error) {
    console.error("Error in createOpportunity", error);
    throw error;
  }
}

export async function getOpportunitiesByProject(projectId: Types.ObjectId) {
  return Opportunity.findOppByProjectId(projectId);
}

export async function getOpportunitiesByStatus(statusId: Types.ObjectId) {
  return Opportunity.findOppByStatusId(statusId);
}

/* Update status of an opportunity (move card between columns) */
export async function updateOpportunityStatus(
  opportunityId: Types.ObjectId,
  newStatusId: Types.ObjectId
) {
  try {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    opportunity.statusId = newStatusId;
    await opportunity.save();
    return opportunity;
  } catch (err: any) {
    console.error("Error in updateOpportunityStatus:", err.message);
    throw new Error("Failed to update opportunity status.");
  }
}

/* Delete opportunity */
export async function deleteOpportunity(opportunityId: Types.ObjectId) {
  try {
    const result = await Opportunity.deleteOne({ _id: opportunityId });

    if (result.deletedCount === 0) {
      throw new Error("Opportunity not found or already deleted.");
    }

    return true;
  } catch (err: any) {
    console.error("Error in deleteOpportunity:", err.message);
    throw new Error("Failed to delete opportunity.");
  }
}
