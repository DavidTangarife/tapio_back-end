import { Request, Response, NextFunction } from "express";
import { parse } from "url"
import { setState, checkState } from "../services/state";
import { findOrCreateUserFromMicrosoft, getUserById } from "../services/user.services";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { buildPkceCodes, confidentialClient, getAuthCodeParams, getEmailsFromDate, getNewMicrosoftClient, getOneEmail, getTokenRequest, silentlyRefreshToken } from "../services/microsoft";
import { AxiosResponse } from "axios";
import { getProjectById, updateLastSync } from "../services/project.services";
import { saveEmailsFromIMAP } from "../services/email.services";

const microsoft_client: ConfidentialClientApplication = confidentialClient;

interface MicrosoftUserData {
  email: string;
  token_cache: string;
  token: string;
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
  const userData: MicrosoftUserData = { email: '', token_cache: '', token: '' };
  try {
    await user_client.acquireTokenByCode(getTokenRequest(req, query)).then((token) => {
      userData.email = token.account!.username;
      userData.token_cache = user_client.getTokenCache().serialize();
      userData.token = token.accessToken;
    })
  } catch (error) {
    next(error)
  }
  const user = await findOrCreateUserFromMicrosoft(userData)
  req.session.user_id = user._id
  req.session.save()
  res.redirect("http://localhost:5173/setup");
};

export const getMicrosoftEmailsByDate = async (req: Request, res: Response, next: NextFunction): Promise<Response | any> => {
  const user = req.session.user_id
  const project_id = req.session.project_id;

  if (!user) {
    return res.redirect('/microsoft-login')
  }
  if (!project_id) {
    return res.redirect("http://localhost:5173/setup")
  }

  const user_account = await getUserById(user)
  const user_data = await silentlyRefreshToken(user_account!.token_cache || '')
  const project = await getProjectById(project_id)
  //const emails: AxiosResponse = await getEmailsFromDate(user_data, new Date(query.date!.toString()))
  const fetchStartDate = project!.lastEmailSync ?? project!.startDate
  const date = new Date(fetchStartDate.getTime() - (Math.abs(project!.startDate.getTimezoneOffset() * 60000) * 2))
  const emails: AxiosResponse = await getEmailsFromDate(user_data, date)
  if (emails.status == 200) {
    const email_objects = emails.data.value.map((x: any) => ({
        mailBoxid: x.id,
        subject: x.subject,
        snippet: x.bodyPreview,
        date: x.createdDateTime,
        from: x.from.emailAddress.address,
        projectId: project?._id,
      }));
      await saveEmailsFromIMAP(email_objects);
      await updateLastSync(project_id);
      return res.status(200).json({ count: email_objects.length });
  } else {
    return res.status(500).send("Sorry, something went wrong");
  }
}
