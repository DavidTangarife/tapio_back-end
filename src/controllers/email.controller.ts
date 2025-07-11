import Email from "../models/email.model";

import { NextFunction, Request, Response } from "express";
import {
  fetchInboxEmails,
  getFilterableEmails,
  assignOpportunityToEmail,
  getEmailsByOppoId,
  searchEmail,
} from "../services/email.services";
import { Types } from "mongoose";
import { getGoogleEmailsByDate } from "./google.controller";
import { getMicrosoftEmailsByDate } from "./microsoft.controller";
import { get_google_auth_client } from "../services/google";
import { google } from "googleapis";
import { getUserById } from "../services/user.services";
import { getProjectById } from "../services/project.services";

/**
 * Controller to return a summary list of email senders for filtering.
 * Responds with an array of senders, each showing one sample email and block status.
 *
 * @route GET /api/projects/filter-senders
 */
export async function getEmailsForFiltering(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const project_id = req.session.project_id;
    const senders = await getFilterableEmails(project_id);
    console.log("not processed emails", senders);
    res.status(200).json(senders);
  } catch (error) {
    console.error("Error in getEmailsForFiltering:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export const directEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    console.log("Directing");
    const user_id = req.session.user_id;
    const user = await getUserById(user_id);

    if (!user) {
      return res.redirect("http://localhost:5173/");
    }
    let fetchedCount = 0;
    if (user!.refresh_token) {
      fetchedCount = (await getGoogleEmailsByDate(req, res, next)) || 0;
    } else if (user!.token_cache) {
      fetchedCount = (await getMicrosoftEmailsByDate(req, res, next)) || 0;
    }
    return res
      .status(200)
      .json({ message: "Fetched emails", count: fetchedCount });
  } catch (err: any) {
    next(err);
  }
};

/**
 * Controller to handle inbox email retrieval for a project.
 *
 * @route GET /api/getemails
 * @param req - Express request object, must contain a valid session with project_id.
 * @param res - Express response object used to send back the filtered emails.
 * @returns - Sends a JSON response or error message.
 */
export async function getInboxEmails(
  req: Request,
  res: Response
): Promise<void> {
  const projectId = req.session.project_id;
  if (!projectId) {
    res.status(400).json({ error: "No project selectd" });
    return;
  }

  const pageUnread = parseInt(req.query.unread as string) || 1;
  const pageRead = parseInt(req.query.read as string) || 1;

  const limitUnread = parseInt(req.query.limitUnread as string) || 10;
  const limitRead = parseInt(req.query.limitRead as string) || 10;

  try {
    const data = await fetchInboxEmails(
      projectId,
      pageUnread,
      limitUnread,
      pageRead,
      limitRead
    );
    res.json(data);
  } catch (error: any) {
    console.error("Error in getInboxEmails:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Controller to update tap-in property of email object
 * used inside the emailItem component in frontend
 *
 * @route PATCH /api/emails/:emailId/tap
 * @param req - Express request object containing: `emailId` in `req.params`and
 *              `isTapped` boolean in `req.body`
 * @param res - Express response object used to send the updated email or error.
 * @returns  Returns JSON with the updated email object if successful,  or an error message
 */
export async function updateTapIn(req: Request, res: Response): Promise<any> {
  const { isTapped } = req.body;
  const emailId = req.params.emailId;

  try {
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });

    email.isTapped = isTapped;
    await email.save();
    res.json(email);
  } catch (err) {
    console.error("Error updating email:", err);
    res.status(500).json({ error: "Failed to update email" });
  }
}

/**
 * Controller to update the `isRead` property of an email object to true.
 * used inside the emailItem component in frontend
 *
 * @route PATCH /api/emails/:emailId/read
 * @param req - Express request object containing the email ID in `req.params`.
 * @param res - Express response object used to send the updated email or error.
 * @returns  Returns JSON with the updated email object if successful, or anerror message
 */
export async function updateIsRead(req: Request, res: Response): Promise<any> {
  const { emailId } = req.body;

  try {
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });

    email.isRead = true;
    await email.save();

    res.json(email);
  } catch (err) {
    console.error("Failed to mark email as read:", err);
    res.status(500).json({ error: "Failed to mark email as read" });
  }
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
 * Controller to update the `isProcessed` and 'isAllowed' property of an email object.
 * used inside the filter component
 *
 * @route PATCH /api/emails/:emailId/process
 * @param req - Express request object containing the email ID in `req.params`.
 * @param res - Express response object used to send the updated email or error.
 * @returns  Returns JSON with the updated email object if successful, or anerror message
 */
export async function processAndApprove(
  req: Request,
  res: Response
): Promise<any> {
  const { isApproved } = req.body;
  const { emailId } = req.params;
  const projectId = req.session.project_id;

  try {
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });

    const sender = extractEmailAddress(email.from);
    await Email.updateMany(
      {
        projectId,
        from: new RegExp(sender, "i"),
      },
      {
        $set: {
          isProcessed: true,
          isApproved: isApproved,
        },
      }
    );

    res.json({ email, message: "All sender emails updated" });
  } catch (err) {
    console.error("Failed to mark email as read:", err);
    res.status(500).json({ error: "Failed to mark email as read" });
  }
}
/**
 * Controller to update the `opportunityId` property of an email object.
 * used inside the AddToBoard component in frontend.
 *
 * @route PATCH /api/emails/:emailId/opportunity
 * @param req - Express request object containing the email ID in req.body.
 * @param res - Express response object used to send the updated email or error.
 * @returns  Returns JSON with the updated email object if successful, or an error message
 */
export async function updateOpportunityId(
  req: Request,
  res: Response
): Promise<any> {
  const { emailId, opportunityId } = req.body;

  try {
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });

    email.opportunityId = opportunityId;
    await email.save();

    res.json(email);
  } catch (err) {
    console.error("Failed to mark email as read:", err);
    res.status(500).json({ error: "Failed to mark email as read" });
  }
}

/**
 * Controller to get email body for a specific emaildid.
 *
 * @route  GET /api/emails/emailid/body
 * @param req - Express request object containing emaiId
 * @param res - Express response object
 * @returns  decoded html email body or an appropriate error response
 */
export async function getEmailBody(req: Request, res: Response): Promise<any> {
  try {
    const { emailId } = req.params;
    const userId = req.session.user_id;

    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });
    const mailId = email.mailBoxId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user info from DB
    const user_account = await getUserById(userId);
    const refreshToken = user_account?.refresh_token;

    if (!refreshToken) {
      return res.status(403).json({ error: "No refresh token available" });
    }

    // Create an authorized Gmail client
    const authClient = get_google_auth_client();
    authClient.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: authClient });

    // Fetch the full email message by ID
    const gmailRes = await gmail.users.messages.get({
      userId: "me",
      id: mailId,
      format: "full",
    });

    const payload = gmailRes.data.payload;

    function findHtmlPart(parts: any[]): string | null {
      for (const part of parts) {
        if (part.mimeType === "text/html" && part.body?.data) {
          return part.body.data;
        }
        if (part.parts) {
          const result = findHtmlPart(part.parts);
          if (result) return result;
        }
      }
      return null;
    }
    const htmlData = payload?.parts
      ? findHtmlPart(payload.parts)
      : payload?.body?.data;
    if (!htmlData) return res.status(404).json({ error: "No HTML body found" });

    const decodedBody = Buffer.from(htmlData, "base64").toString("utf-8");

    return res.status(200).json({ body: decodedBody });
  } catch (err) {
    console.error("Failed to get email body:", err);
    return res.status(500).json({ error: "Failed to get email body" });
  }
}

/**
 * Controller to get specific email data from database and return email object
 * used inside the viewEmail component in frontend
 *
 * @route GET /api/emails/:emailid
 * @param req - Express request object containing the email ID in `req.params`.
 * @param res - Express response object used to return the email data or an error.
 * @returns  Returns a JSON response with the email object if found,
 *           or an error message if not found or on failure.
 */
export async function getEmailData(req: Request, res: Response): Promise<any> {
  const { emailId } = req.params;
  try {
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });

    return res.json(email);
  } catch (err) {
    console.error("Failed to mark email as read:", err);
    res.status(500).json({ error: "Failed to mark email as read" });
  }
}

export async function getAllowedEmails(
  req: Request,
  res: Response
): Promise<any> {
  const projectId = req.session.project_id;

  const emails = await Email.find({ projectId, isApproved: true }).sort({
    date: -1,
  });
  res.json({ emails });
}

export async function getBlockedEmails(
  req: Request,
  res: Response
): Promise<any> {
  const projectId = req.session.project_id;

  const emails = await Email.find({ projectId, isApproved: false }).sort({
    date: -1,
  });
  res.json({ emails });
}

// Assign OpportunityId to an email
export const emailAssignOpportunity = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { emailId } = req.params;
  const { opportunityId } = req.body;

  console.log("Received opportunityId:", opportunityId);

  if (!emailId || !opportunityId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const updatedEmail = await assignOpportunityToEmail(
      new Types.ObjectId(emailId),
      new Types.ObjectId(opportunityId)
    );
    console.log(updatedEmail);
    return res.status(200).json(updatedEmail);
  } catch (err: any) {
    console.error("Error assigning opportunity to email:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const emailsFromOpportunity = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { oppoId } = req.params;

  if (!oppoId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const emails = await getEmailsByOppoId(new Types.ObjectId(oppoId));
    return res.status(200).json(emails);
  } catch (err: any) {
    console.error(
      "Error retrieving emails from that opportunity:",
      err.message
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Search email model for a specific title or sender
 */
export async function fetchSearchedEmails(
  req: Request,
  res: Response
): Promise<any> {
  const query = req.query.q?.toString().trim();
  const projectId = req.session.project_id
  const filterType = req.query.filterType?.toString();
  
  if (typeof query !== "string") {
    return res.status(400).json({ error: "Invlid search query" });
  }

  try {
    const results = await searchEmail(projectId, query, filterType as any);
    return res.json({ emails: results });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Search failed." });
  }
}
