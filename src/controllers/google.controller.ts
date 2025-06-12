import { Request, Response, NextFunction } from "express";
import { get_google_auth_client, get_google_auth_url_email, getGmailApi, processGoogleCode } from "../services/google";
import { parse } from "url"
import { OAuth2Client } from "googleapis-common";
import { setState, checkState } from "../services/state";
import { findOrCreateUserFromGoogle, getUserById } from "../services/user.services";
import { Types } from "mongoose";
import { saveEmailsFromIMAP } from "../services/email.services";

const google_client: OAuth2Client = get_google_auth_client('http://localhost:3000/api/google-redirect')

interface GoogleUserData {
  email: string;
  refresh_token: string;
}

export const loginWithGoogle = (req: Request, res: Response, next: NextFunction) => {
  const url = get_google_auth_url_email(google_client, setState(req))
  console.log(url)
  res.redirect(url)
}

export const handleGoogleRedirect = async (req: Request, res: Response, next: NextFunction) => {
  const query = parse(req.url || "", true).query;

  if (query.error) next(query.error);
  checkState(req, String(query.state));
  const result = await processGoogleCode(String(query.code), google_client)
  const userData: GoogleUserData = { email: result.email!, refresh_token: result.refresh_token! }
  const user = await findOrCreateUserFromGoogle(userData)

  req.session.user_id = user[0]._id
  req.session.save();
  res.send('User Logged in ' + user[0].email + ' and this user is ' + user[1])
}

export const getEmailsByDate = async (req: Request, res: Response, next: NextFunction) => {
  {
    const query = parse(req.url || "", true).query;
    const user = req.session.user_id

    if (!user) {
      res.redirect('/google-login')
    }

    const user_account = await getUserById(user)
    const emails = await getGmailApi(user_account!.refresh_token || '', new Types.ObjectId(1))
    saveEmailsFromIMAP(emails)
    res.send(emails)
  }
}
