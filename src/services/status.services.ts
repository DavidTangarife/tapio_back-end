import Status from "../models/status.model"
import { Types } from "mongoose";

interface CreateStatusInput {
  projectId: Types.ObjectId;
  title: string;
  color?: string;
  order?: number;
}

/* Create and return a new project */
export async function createStatus(data: CreateStatusInput) {
  try {
    const status = await Status.create(data);
    console.log("status created successfully:", status);
    return status;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("This status title already exists.");
    }
    console.error("Error in createStatus", error);
    throw error;
  }
}

export async function getStatusesByProject(projectId: Types.ObjectId) {
  return Status.find({ projectId }).exec();
}

/* Update a status (rename or change color) */
export async function updateStatus(
  statusId: Types.ObjectId,
  updates: { title?: string; color?: string; order?: number }
) {
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      throw new Error("Status not found");
    }

    if (updates.title) status.title = updates.title.trim();
    if (updates.color) status.color = updates.color;

    await status.save();
    return status;
  } catch (err: any) {
    console.error("Error in updateStatus:", err.message);
    throw new Error("Failed to update status.");
  }
}

export async function getStatusById(_id: string) {
  return Status.findOne({ _id }).exec()
}


export async function updateStatusOrder(_id: string, order: number) {
  try {
    const status = await Status.findOne({ _id });
    if (status) {
      status.order = order;
      await status.save();
      console.log('Updated ', _id)
    }
  } catch (err) {
    console.log('Something went wrong while saving ', _id)
  }
}

export async function deleteStatusById(_id: string) {
  //TODO: This probably needs to be protected better but I'm trying to move quickly as we're getting closer
  try {
    const status = await Status.findOneAndDelete({ _id })
  } catch (err) {
    console.error(err)
  }
}
