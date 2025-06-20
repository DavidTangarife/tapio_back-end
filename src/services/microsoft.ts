import {
  Configuration,
  ConfidentialClientApplication,
  CryptoProvider,
  AuthorizationUrlRequest,
  AuthorizationCodeRequest,
  SilentFlowRequest,
} from "@azure/msal-node"
import { RequestWithSession } from "../types/session";
import axios from "axios";

const cryptoProvider = new CryptoProvider();

const config: Configuration = {
  auth: {
    clientId: "bf527d5e-3aeb-4d2f-a04d-152004a014dc",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authority: 'https://login.microsoftonline.com/consumers/',
  },
  system: {
    loggerOptions: {
    },
  },
};

interface MicrosoftUserData {
  email: string;
  token_cache: string;
  token: string;
};

//==========================================
// Codes that Microsoft will use to validate
// this auth request
//==========================================

export const buildPkceCodes = async (req: RequestWithSession) => {
  cryptoProvider.generatePkceCodes().then(({ verifier, challenge }) => {
    if (!req.session.pkceCodes) {
      req.session.pkceCodes = {
        challengeMethod: "S256"
      };
    };
    req.session.pkceCodes.verifier = verifier;
    req.session.pkceCodes.challenge = challenge;
  });
};

//===========================================
// Parameters used to build the Microsoft
// auth URL
//===========================================

export const getAuthCodeParams = (req: RequestWithSession) => {
  const authCodeUrlParameters: AuthorizationUrlRequest = {
    scopes: ["https://graph.microsoft.com/Mail.Read"],
    redirectUri: "http://localhost:3000/api/microsoft-redirect",
    codeChallenge: req.session.pkceCodes.challenge,
    codeChallengeMethod: req.session.pkceCodes.challengeMethod,
    state: req.session.state,
  };
  return authCodeUrlParameters;
};

//==========================================
// Builds the tokenRequest parameters for
// the confidentialClient
//==========================================

export const getTokenRequest = (req: RequestWithSession, query: any) => {
  const tokenRequest: AuthorizationCodeRequest = {
    code: query.code as string,
    scopes: ["https://graph.microsoft.com/Mail.Read"],
    redirectUri: "http://localhost:3000/api/microsoft-redirect",
    codeVerifier: req.session.pkceCodes!.verifier,
    clientInfo: query.client_info as string,
  };
  return tokenRequest;
};

//================================================
// Silently refresh the Microsoft Access Token if
// possible.
//================================================

export const silentlyRefreshToken = async (token_cache: string) => {
  const client = getNewMicrosoftClient();
  client.getTokenCache().deserialize(token_cache);
  const accounts = await client.getTokenCache().getAllAccounts();

  const tokenRequest: SilentFlowRequest = {
    account: accounts[0],
    scopes: ["https://graph.microsoft.com/Mail.Read"],
  };
  const userData: MicrosoftUserData = { email: '', token_cache: '', token: '' };
  await client.acquireTokenSilent(tokenRequest).then((token) => {
    userData.email = token.account!.username;
    userData.token_cache = client.getTokenCache().serialize();
    userData.token = token.accessToken;
  }).catch((error) => {
    throw new Error(error);
  })
  return userData;
}

export const getNewMicrosoftClient = (): ConfidentialClientApplication => {
  return new ConfidentialClientApplication(config);
};

export const confidentialClient = new ConfidentialClientApplication(config);

//=====================================================
// Builds an XOAUTH2 token. This is only required if
// accessing IMAP or SMTP server.  API calls shouldn't
// require it.
//=====================================================

export const buildXOAuth2Token = (username: string, accessToken: string) => {
  const token: string = Buffer.from(
    "user=" +
    username +
    "\x01auth=Bearer " +
    accessToken +
    "\x01\x01"
  ).toString("base64");
  return token;
};

//=====================================================
// Takes a MicrosoftUserData object with an auth token 
// & a date and then returns the response of all the
// emails since that date.
//=====================================================

export const getEmailsFromDate = async (userData: MicrosoftUserData, date: Date) => {
  const response: any = await axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$filter=ReceivedDateTime ge ${date.toISOString().substring(0, 19)}Z&count=true`, { headers: { 'Authorization': `Bearer ${userData.token}` } })
    .then((result: any) => {
      return axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$filter=ReceivedDateTime ge ${date.toISOString().substring(0, 19)}Z&top=${result.data['@odata.count']}`, { headers: { 'Authorization': `Bearer ${userData.token} ` } });
    });
  console.log(response)
  return response;
};

//=====================================================
// Takes a MicrosoftUserData object with an auth token 
// & an email id and then returns that email.
//=====================================================

export const getOneEmail = async (userData: MicrosoftUserData, id: string) => {
  const response: any = await axios.get(`https://graph.microsoft.com/v1.0/me/messages/${id}`, { headers: { 'Authorization': `Bearer ${userData.token}` } })
  return response;
};
