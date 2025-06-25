import { Request, Response, NextFunction } from "express";
import {
  get_google_auth_client,
  get_google_auth_url_email,
  getGmailApi,
  processGoogleCode,
} from "../services/google";
import { parse } from "url";
import { OAuth2Client } from "googleapis-common";
import { setState, checkState } from "../services/state";
import {
  emailsConnected,
  findOrCreateUserFromGoogle,
  getUserById,
} from "../services/user.services";
import { Types } from "mongoose";
import { getEmailsByProject, saveEmailsFromIMAP } from "../services/email.services";
import { getProjectById, updateLastSync } from "../services/project.services";
import { getInboxEmails } from "./email.controller";

const google_client: OAuth2Client = get_google_auth_client(
  "http://localhost:3000/api/google-redirect"
);

interface GoogleUserData {
  email: string;
  refresh_token: string;
}

export const loginWithGoogle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = get_google_auth_url_email(google_client, setState(req));
  console.log(url);
  res.redirect(url);
};

export const handleGoogleRedirect = async (req: Request, res: Response, next: NextFunction) => {
  const query = parse(req.url || "", true).query;

  if (query.error) next(query.error);
  checkState(req, String(query.state));
  const result = await processGoogleCode(String(query.code), google_client);
  const userData: GoogleUserData = {
    email: result.email!,
    refresh_token: result.refresh_token!,
  };
  const user = await findOrCreateUserFromGoogle(userData);

  req.session.user_id = user._id;
  if (user.lastProject) {
    req.session.project_id = user.lastProject
  }
  req.session.save();

  console.log(req.session)
  if (user.onBoarded) {
    res.redirect("http://localhost:5173/home");
  } else {
    res.redirect("http://localhost:5173/setup");
  }
};

export const getGoogleEmailsByDate = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.session.user_id;
  const project_id = req.session.project_id;

  if (!user_id) {
    res.redirect("/google-login");
  }
  if (!project_id) {
    res.redirect("http://localhost:5173/setup")
  }
  const user_account = await getUserById(user_id);
  const project = await getProjectById(project_id)
 if (!user_account || !project) {
    return res.status(404).json({ error: "User or project not found" });
  }

  // Determine fetchStartDate
  let fetchStartDate: Date;
  if (!user_account.inboxConnected) {
    fetchStartDate = new Date(project.startDate);
  } else {
    const lastSync = project.lastEmailSync ?? project.startDate;
    fetchStartDate = new Date(new Date(lastSync).getTime() - 60 * 1000); // 1-minute buffer
  }

  console.log("fetch start date inside google function:", fetchStartDate);

  // Fetch emails
  const emails = await getGmailApi(user_account.refresh_token || "", project_id, fetchStartDate);
  if (emails && emails.length > 0) {
    await saveEmailsFromIMAP(emails);

    // Mark inbox as connected if it's the first successful fetch
    if (!user_account.inboxConnected) {
      user_account.inboxConnected = true;
      await user_account.save();
    }

    await emailsConnected(user_id);
  } else {
    console.log("✅ Gmail API returned 0 emails.");
  }

  // Update last sync time
  await updateLastSync(project_id);

  // Re-fetch updated project for session
  const updatedProject = await getProjectById(project_id);
  req.session.project_id = updatedProject?._id;

  return getInboxEmails(req, res);
};
