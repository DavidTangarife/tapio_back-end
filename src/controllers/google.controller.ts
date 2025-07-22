import { Request, Response, NextFunction } from "express";
import {
  createCalendarEvent,
  get_google_auth_client,
  get_google_auth_url_email,
  getGmailApi,
  processGoogleCode,
  sendGmailEmail,
} from "../services/google";
import { parse } from "url";
import { OAuth2Client } from "googleapis-common";
import { setState, checkState } from "../services/state";
import {
  findOrCreateUserFromGoogle,
  getUserById,
} from "../services/user.services";
import { saveEmailsFromIMAP } from "../services/email.services";
import { getProjectById, inboxConnected, updateLastSync } from "../services/project.services";

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
  console.log('\n\n', query.code, '\n\n')
  const result = await processGoogleCode(String(query.code), google_client);
  const userData: GoogleUserData = {
    email: result.email!,
    refresh_token: result.refresh_token!,
  };
  console.log(userData)
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

export const getGoogleEmailsByDate = async (req: Request, res: Response, next: NextFunction): Promise<number | any> => {
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
  const baseDate = project.lastEmailSync ?? project.startDate;
  const fetchStartDate = new Date(new Date(baseDate).getTime() - 60 * 1000);

  // Fetch emails
  const emails = await getGmailApi(user_account.refresh_token || "", project_id, fetchStartDate);
  let savedCount = 0;
  if (emails && emails.length > 0) {
    savedCount = await saveEmailsFromIMAP(emails);
    if (savedCount > 0) {
      await inboxConnected(project_id);
    }
  } else {
    console.log("Gmail API returned 0 emails.");
  }
  await updateLastSync(project_id);
  return savedCount || 0;
};

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.session.user_id;
  const user_account = await getUserById(user_id)

  if (user_account) {
    sendGmailEmail(user_account, req.body)
  }
  res.send('OK')
}


export const createCalendarEventController = async (req: Request, res: Response, next: NextFunction) :Promise<number | any> => {
  const userId = req.session.user_id;
  const user = await getUserById(userId);

  if (!user || !user.refresh_token) {
    return res.status(403).json({ error: "No refresh token found for user" });
  }
  const {title, description, location} = req.body;
  const eventData = {
    summary: title,
    description,
    location,
    start: {
      dateTime: '2025-07-25T10:30:00+10:00', // Change the date here
      timeZone: "Australia/Sydney"
    },
    end: {
      dateTime: '2025-07-25T11:30:00+10:00', // Change the date here
      timeZone: "Australia/Sydney"
    },
  };
  try {
    const calendarEvent = await createCalendarEvent(user, eventData);

    return res.status(200).json({
      success: true,
      event: calendarEvent,
    });
  } catch (err) {
    console.error("Failed to create calendar event:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}