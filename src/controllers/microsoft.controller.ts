import { Request, Response, NextFunction } from "express";
import { parse } from "url"
import { setState, checkState } from "../services/state";
import { findOrCreateUserFromMicrosoft } from "../services/user.services";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { buildPkceCodes, confidentialClient, getAuthCodeParams, getNewMicrosoftClient, getTokenRequest } from "../services/microsoft";

const microsoft_client: ConfidentialClientApplication = confidentialClient;

interface MicrosoftUserData {
  email: string;
  token_cache: string;
};

export const loginWithMicrosoft = async (req: Request, res: Response, next: NextFunction) => {
  await buildPkceCodes(req);
  setState(req);
  microsoft_client.getAuthCodeUrl(getAuthCodeParams(req)).then((url) => {
    res.redirect(url);
  });
};

export const handleMicrosoftRedirect = async (req: Request, res: Response, next: NextFunction) => {
  const query = parse(req.url || "", true).query;
  const user_client: ConfidentialClientApplication = getNewMicrosoftClient();

  if (query.error) next(query.error);
  checkState(req, String(query.state));
  let userData: MicrosoftUserData = { email: '', token_cache: '' };
  try {
    await user_client.acquireTokenByCode(getTokenRequest(req, query)).then((token) => {
      userData = { email: token.account!.username, token_cache: user_client.getTokenCache().serialize() }
    })
  } catch (error) {
    next(error)
  }
  const user = await findOrCreateUserFromMicrosoft(userData)
  req.session.user_id = user[0]._id
  res.send('User Logged in ' + user[0]!.email + ' and this user is ' + user[1])
};
