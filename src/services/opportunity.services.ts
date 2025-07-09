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

interface EditOpportunity {
  statusId: Types.ObjectId;
  title: string;
  snippets?: [object];
  snippFlag?: boolean;
  description?: {
    location: string;
    type: string;
    salary: string;
    posted: string;
  };
}

/* Logic to generate the LogoURL */
function generateLogoUrl(companyName?: string): string {
  if (!companyName) {
    return "/default-logo.png";
  }
  const domain = companyName.toLowerCase().replace(/\s+/g, "") + ".com";
  return `https://img.logo.dev/${domain}`;
}

/* Create and return a new opportunity */
export async function createOpportunity(data: CreateOpportunityInput) {
  try {
    const logoUrl = generateLogoUrl(data.company.name);
    const opportunity = await Opportunity.create({
      ...data,
      company: {
        ...data.company,
        logoUrl,
        brandColor: "",
      },
    });
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

/* Update opportunity */
export async function updateOpportunity(
  opportunityId: Types.ObjectId,
  updatedFields: EditOpportunity
) {
  try {
    var updateOps: any = {};
    const { snippets, snippFlag } = updatedFields;

    if (snippets && Array.isArray(snippets)) {
      if (snippFlag) {
        updateOps.$set = updateOps.$set || {};
        updateOps.$set.snippets = snippets;
      } else {
        updateOps.$push = {
          snippets: { $each: snippets },
        };
      }

      delete updatedFields.snippets;
      delete updatedFields.snippFlag;
    }

    if (Object.keys(updatedFields).length > 0) {
      updateOps.$set = {
        ...(updateOps.$set || {}),
        ...updatedFields,
      };
    }

    const result = await Opportunity.findByIdAndUpdate(
      opportunityId,
      updateOps,
      { new: true }
    );

    if (!result) throw new Error("Opportunity not found");
    return result;
  } catch (err: any) {
    console.error("Error in updateOpportunityFields:", err.message);
    throw new Error("Failed to update opportunity.");
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
    console.error("Error in delete Opportunity:", err.message);
    throw new Error("Failed to delete opportunity.");
  }
}
