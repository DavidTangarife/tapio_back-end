import Email from "../models/email.model"
import { Types } from "mongoose";
import Project from "../models/project.model"


/**
 * Saves an array of parsed email objects to the database in a single bulk insert.
 * Uses `insertMany` with `ordered: false` to allow partial success.
 * If some emails fail to insert, retries them one by one.
 * @parsedEmailArray: Array of email objects parsed from IMAP to save in DB.
 */
export async function saveEmailsFromIMAP(parsedEmailArray: any[]): Promise<void> {
  if (!Array.isArray(parsedEmailArray) || parsedEmailArray.length === 0) {
    console.warn("No emails to save.");
    return;
  }
  const emailsToInsert = parsedEmailArray.map(email => ({
    ...email,
    createdAt: new Date(),
  }));

  try {
    await Email.insertMany(emailsToInsert, { ordered: false });
    console.log(`Inserted ${emailsToInsert.length} emails`);
  } catch (err: any) {
    if (err.writeErrors) {
      console.warn(`${err.writeErrors.length} emails failed. Retrying individually...`);

      for (const writeError of err.writeErrors) {
        const failedEmail = writeError.getOpertaion();

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
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/**
 * Builds a filter object for regex inclusion/exclusion. This is a helper function to query emails
 * @param include Array of strings to include
 * @param exclude Array of strings to exclude
 */
function buildRegexFilter(include?: string[], exclude?: string[]): any | null {
  const filter: any = {};

  if (include?.length) {
    filter.$regex = include.map(escapeRegex).join("|");
    filter.$options = "i";
  }

  if (exclude?.length) {
    filter.$not = new RegExp(exclude.map(escapeRegex).join("|"), "i");
  }

  return Object.keys(filter).length ? filter : null;
}

/**
 * Fetches emails for a test project with optional filters applied in DB.
 * Filters include matching subject keywords and sender email patterns.
 * Currently hardcoded for testing with a specific project ID.
 */
export async function getFilteredEmails(projectId: string) {
  // const projectId = new Types.ObjectId("");
  
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const { filters, blockedFilters, startDate } = project;

  // Find the latest email already saved for this project
  const latestEmail = await Email.findOne({ projectId }).sort({ date: -1 });
  const dateThreshold = latestEmail && latestEmail.date
    ? latestEmail.date
    : startDate;

  // Create a base query object to match emails for this project
  const query: any = {
    projectId,
    date: { $gt: dateThreshold },
    $and: []
  };
  const subjectFilter = buildRegexFilter(filters?.keywords, blockedFilters?.keywords);
  if (subjectFilter) query.$and.push({ subject: subjectFilter });

  // Build sender filter (includes + excludes)
  const fromFilter = buildRegexFilter(filters?.senders, blockedFilters?.senders);
  if (fromFilter) query.$and.push({ from: fromFilter });

  // If no $and filters were added, remove the property
  if (!query.$and.length) delete query.$and;
  
  return await Email.find(query).sort({ date: -1 });
}

// {
//   projectId: new ObjectId("682efb5211da37c9c95e0779"),
//   date: { $gte: 2024-05-15T00:00:00.000Z },
//   subject: {
//     $regex: "mentoring|vision",
//     $options: "i"
//   },
//   from: {
//     $regex: "info@mentorloop\\.com|careers@example\\.com",
//     $options: "i"
//   }
// }