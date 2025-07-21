import Template, { ITemplate } from "../models/template.model"
import { Types } from "mongoose";

interface CreateTemplateInput {
  templateName: string;
  text: string;
  userId: Types.ObjectId;
}

export async function createTemplate(data: CreateTemplateInput): Promise<ITemplate> {
  try {
    const template = await Template.create(data);
    return template;
  } catch (error) {
    console.error("Error in createTemplate:", error);
    throw error;
  }
}
