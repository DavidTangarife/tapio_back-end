import Email from "../models/email.model";
import Project from "../models/project.model";
import User from "../models/user.model"

import { NextFunction, Request, Response } from 'express';
import { fetchInboxEmails, getFilterableEmails, saveEmailsFromIMAP } from "../services/email.services"
import { get_imap_connection, sender_and_subject_since_date_callback } from "../services/imap";
import { Types } from "mongoose";
import { get_xoauth2_generator, get_xoauth2_token } from "../services/xoauth2";
import { getGoogleEmailsByDate } from "./google.controller";
import { getMicrosoftEmailsByDate } from "./microsoft.controller";
import { get_google_auth_client } from "../services/google";
import { google } from "googleapis";
import { getUserById } from "../services/user.services";

export const fetchEmailsController = async (req: Request, res: Response): Promise<any> => {
  console.log('fetchEmailsController called')
  try {
    const { projectId } = req.body;
    console.log(new Types.ObjectId(String(projectId)))
    const userId = req.session.user_id;
    console.log(userId)
    if (!userId || !projectId) {
      return res.status(400).json({ error: "Missing userId or projectId" });
    }

    const user = await User.findById(userId);
    if (!user || !user.email || !user.refresh_token) {
      return res.status(401).json({ error: "Email account not connected" });
    }


    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    // Find the project to get createdAt date
    const project = await Project.findById(new Types.ObjectId(String(projectId)));
    if (!project) return res.status(404).json({ error: "Project not found" });
    console.log(project)
    const xoauth2gen = get_xoauth2_generator(user.email, user.refresh_token);
    const xoauth2Token = await get_xoauth2_token(xoauth2gen);
    const imap = get_imap_connection(user.email, xoauth2Token);
    console.log("imap connected")
    const dateStr = project.startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
    console.log(dateStr)
    const emails: any = sender_and_subject_since_date_callback(imap, dateStr, projectId, async (emails) => {
      console.log('Fetched emails:', emails);
      await saveEmailsFromIMAP(emails);
      res.status(201).json(emails)
    });
    console.log(emails)


  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Controller to return a summary list of email senders for filtering.
 * Responds with an array of senders, each showing one sample email and block status.
 *
 * @route GET /api/projects/:projectId/filter-senders
 */
export async function getEmailsForFiltering(req: Request, res: Response): Promise<any> {
  try {
    const project_id = req.session.project_id;
    const senders = await getFilterableEmails(project_id);

    res.status(200).json(senders);
  } catch (error) {
    console.error("Error in getEmailsForFiltering:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export const directEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Directing')
    const user_id = req.session.user_id
    const user = await getUserById(user_id)

    if (!user) {
      res.redirect("http://localhost:5173/")
    }
    if (user!.refresh_token) {
      getGoogleEmailsByDate(req, res, next)
    } else if (user!.token_cache) {
      getMicrosoftEmailsByDate(req, res, next)
    }
  } catch (err: any) {
    next(err)
  }
}
/**
 * Controller to handle inbox email requests.
 * Responds with filtered emails that match the project's allowed sender list.
 */
export async function getInboxEmails(req: Request, res: Response): Promise<void> {
  const projectId = req.session.project_id;
  console.log('Getting Inbox')
  console.log(projectId)

  try {
    const inboxEmails = await fetchInboxEmails(projectId);
    console.log(inboxEmails)
    res.json({ emails: inboxEmails });
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
  const emailId = req.params.emailId

  try {
    const email = await Email.findById(emailId);
    if (!email) return res.status(404).json({ error: "Email not found" });

    email.isTapped = isTapped;
    await email.save();
    res.json(email);
  } catch (err) {
    console.error("Error updating email:", err);
    res.status(500).json({ error: "Failed to update email" })
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
    const mailId = email.mailBoxId

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user info from DB
    const user_account = await getUserById(userId);
    const refreshToken = user_account?.refresh_token;

    if (!refreshToken) {
      return res.status(403).json({ error: 'No refresh token available' });
    }

    // Create an authorized Gmail client
    const authClient = get_google_auth_client();
    authClient.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: authClient });

    // Fetch the full email message by ID
    const gmailRes = await gmail.users.messages.get({
      userId: 'me',
      id: mailId,
      format: 'full',
    });

    const payload = gmailRes.data.payload;

    // Try to get the html body
    const part = payload?.parts?.find(
      (part) => part.mimeType === 'text/html'
    ) || payload;

    const bodyData = part?.body?.data;

    if (!bodyData) {
      return res.status(404).json({ error: 'No body found in this email' });
    }

    // Decode Base64
    const decodedBody = Buffer.from(bodyData, 'base64').toString('utf-8');

    return res.status(200).json({ body: decodedBody });
  } catch (err) {
    console.error('Failed to get email body:', err);
    return res.status(500).json({ error: 'Failed to get email body' });
  }
};



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
