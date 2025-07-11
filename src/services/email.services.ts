import Email from "../models/email.model";
import { Types } from "mongoose";
import Project from "../models/project.model";
import { inboxConnected } from "./project.services";

/**
 * Saves an array of parsed email objects to the database in a single bulk insert.
 * Uses `insertMany` with `ordered: false` to allow partial success.
 * If some emails fail to insert, retries them one by one.
 * @parsedEmailArray: Array of email objects parsed from IMAP to save in DB.
 */
export async function saveEmailsFromIMAP(
  parsedEmailArray: any[]
): Promise<number | any> {
  console.log(parsedEmailArray);
  if (!Array.isArray(parsedEmailArray) || parsedEmailArray.length === 0) {
    console.warn("No emails to save.");
    return;
  }
  const projectId = parsedEmailArray[0]?.projectId;
  const existing = await Email.find({
    projectId,
    mailBoxId: { $in: parsedEmailArray.map((e) => e.mailBoxId) },
  });

  const existingIds = new Set(existing.map((e) => e.mailBoxId));

  const newEmails = parsedEmailArray.filter(
    (e) => !existingIds.has(e.mailBoxId)
  );
  if (!projectId) {
    console.error("Missing projectId in email data");
    return;
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      console.error("Project not found");
      return;
    }

    let existingFilters = project.filters ?? [];
    let existingBlocked = project.blocked ?? [];
    newEmails.forEach((e) => {
      const senderEmail = extractEmailAddress(e.from);
      if (existingFilters.includes(senderEmail)) {
        e.isApproved = true;
        e.isProcessed = true;
      } else if (existingBlocked.includes(senderEmail)) {
        e.isApproved = false;
        e.isProcessed = true;
      }
    });
    await Email.insertMany(newEmails);
    console.log(`Inserted ${newEmails.length} emails`);
    
    await project.save();
    console.log("Project filters updated with new senders.");
    return newEmails.length;
  } catch (err: any) {
    if (err.writeErrors) {
      console.warn(
        `${err.writeErrors.length} emails failed. Retrying individually...`
      );

      for (const writeError of err.writeErrors) {
        const failedEmail = writeError.getOperation();

        try {
          await Email.create(failedEmail);
          console.log("Retried and saved one failed email.");
        } catch (singleErr) {
          console.error("Retry failed for one email:", singleErr);
        }
      }
    } else {
      console.error("Unexpected insert error:", err);
    }
  }
}

export async function getEmailsByProject(projectId: string) {
  return await Email.findByProjectId(new Types.ObjectId(projectId));
}

// Escape any special characters in a string to safely use in a regular expression
function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a filter object for regex inclusion/exclusion. This is a helper function to query emails
 * @param include Array of strings to include
 * @param exclude Array of strings to exclude
 */
function buildRegexFilter(include?: string[], exclude?: string[]): any | null {
  const filter: any = {};

  if (include?.length) {
    const includePattern = include.map(escapeRegex).join("|");
    filter.$regex = new RegExp(includePattern, "i");
  }

  if (exclude?.length) {
    const excludePattern = exclude.map(escapeRegex).join("|");
    filter.$not = new RegExp(excludePattern, "i");
  }

  return Object.keys(filter).length ? filter : null;
}

/**
 * Extracts just the email address from a "name <email>" format.
 * If no angle brackets are found, trims and returns the original string.
 */
function extractEmailAddress(from: string): string {
  if (!from) return "";
  // Remove invisible characters (like zero-width spaces)
  const cleanFrom = from.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  const angleMatch = cleanFrom.match(/<([^<>]+)>/);
  if (angleMatch) return angleMatch[1].trim().toLowerCase();
  const emailMatch = cleanFrom.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return (emailMatch ? emailMatch[0] : "").trim().toLowerCase();
  }

/**
 * Fetches a list of unique email senders from a project's emails.
 * Each sender includes one sample email, the original `from` string, subject, and date.
 * Also determines if the sender is blocked (not present in the project's filters).
 *
 * @param projectId - The ID of the project whose emails are being analyzed
 * @returns Array of sender summaries, each representing one unique sender
 * @throws Error if the project does not exist
 */
export async function getFilterableEmails(projectId: string | Types.ObjectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const emails = await Email.find({ projectId, isProcessed: false }).sort({
    date: -1,
  });

  return emails;
}

/**
 * Fetches inbox emails for a given project based on its filters
 * Only emails from allowed senders (filters) are returned.
 * @param projectId - The ID of the project whose emails to fetch.
 * @returns Filtered list of emails considered part of the inbox.
 */
export async function fetchInboxEmails(
  projectId: string,
  pageUnread = 1,
  limitUnread = 10,
  pageRead = 1,
  limitRead = 10  
) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const filters = project.filters || [];
  const lastSync = project.lastEmailSync;
  const allEmails = await Email.find({
    projectId,
    date: { $lte: lastSync },
  }).sort({ date: -1 });
  const filteredEmails = allEmails.filter((email) => {
    const fromEmail = extractEmailAddress(email.from);
    return filters.includes(fromEmail);
  });

  const tapped = filteredEmails.filter((e) => e.isTapped);
  const unreadFiltered = filteredEmails.filter((e) =>  !e.isRead && !e.isTapped);
  const readFiltered = filteredEmails.filter((e) => e.isRead && !e.isTapped);
  
  const unreadEmails = unreadFiltered.slice(
    (pageUnread - 1) * limitUnread,
    pageUnread * limitUnread
  );

  const readEmails = readFiltered.slice(
    (pageRead - 1) * limitRead,
    pageRead * limitRead
  );

  return {
    tapped,
    unread: {
      emails: unreadEmails,
      total: unreadFiltered.length,
      page: pageUnread,
      pages: Math.ceil(unreadFiltered.length / limitUnread),
    },
    read: {
      emails: readEmails,
      total: readFiltered.length,
      page: pageRead,
      pages: Math.ceil(readFiltered.length / limitRead),
    },
    inboxConnected: project.inboxConnected
  }

}

export async function assignOpportunityToEmail(
  emailId: Types.ObjectId,
  oppoId: Types.ObjectId
) {
  const updated = await Email.findByIdAndUpdate(
    emailId,
    { $set: { opportunityId: oppoId } },
    { new: true }
  );
  if (!updated) throw new Error("Email not found");
  return updated;
}

export async function getEmailsByOppoId(projectId: Types.ObjectId) {
  return await Email.findByOppoId(new Types.ObjectId(projectId));
}
/**
 *
 */
export async function searchEmail(projectId: string, query: string, filterType?: "new" | "allowed" | "blocked") {
  if (!query.trim()) return [];
  const baseFilter: any = {
    projectId,
    $or: [
      { subject: { $regex: query, $options: "i" } },
      { from: { $regex: query, $options: "i" } },
    ]};
  if (filterType === "allowed") {
    baseFilter.isProcessed = true;
    baseFilter.isApproved = true;
  } else if (filterType === "blocked") {
    baseFilter.isProcessed = true;
    baseFilter.isApproved = false;
  } else if (filterType === "new") {
    baseFilter.isProcessed = false;
  }

  return Email.find(baseFilter);
}
