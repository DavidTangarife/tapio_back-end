import { Request, Response, NextFunction } from "express";
import { get_google_auth_client, get_google_auth_url_email, processGoogleCode } from "../services/google";
import url from "url"
import { OAuth2Client } from "googleapis-common";
import { setState, checkState } from "../services/state";

const google_client: OAuth2Client = get_google_auth_client('http://localhost:3000/api/google-redirect')

export const loginWithGoogle = (req: Request, res: Response, next: NextFunction) => {
  const url = get_google_auth_url_email(google_client, setState(req))
  console.log(url)
  res.redirect(url)
}

export const handleGoogleRedirect = async (req: Request, res: Response, next: NextFunction) => {
  const query = url.parse(req.url || "", true).query;

  if (query.error) next(query.error);
  checkState(req, String(query.state));
  const result = await processGoogleCode(String(query.code), google_client)
  res.json(result);
}
