import {
  LogLevel,
  Configuration,
  ConfidentialClientApplication,
  CryptoProvider,
  AuthorizationUrlRequest,
  AuthorizationCodeRequest,
  SilentFlowRequest,
} from "@azure/msal-node"
import { RequestWithSession } from "../types/session";

const cryptoProvider = new CryptoProvider();

const config: Configuration = {
  auth: {
    clientId: "bf527d5e-3aeb-4d2f-a04d-152004a014dc",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authority: 'https://login.microsoftonline.com/consumers/',
  },
  system: {
    loggerOptions: {
      loggerCallback(
        loglevel: LogLevel,
        message: string,
        containsPii: boolean
      ) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    },
  },
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
  })
}

//===========================================
// Parameters used to build the Microsoft
// auth URL
//===========================================

export const getAuthCodeParams = (req: RequestWithSession) => {
  const authCodeUrlParameters: AuthorizationUrlRequest = {
    scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"],
    redirectUri: "http://localhost:3000/api/microsoft-redirect",
    codeChallenge: req.session.pkceCodes.challenge,
    codeChallengeMethod: req.session.pkceCodes.challengeMethod,
    state: req.session.state,
  };
  return authCodeUrlParameters
}

//==========================================
// Builds the tokenRequest parameters for
// the confidentialClient
//==========================================

export const getTokenRequest = (req: RequestWithSession, query: any) => {
  const tokenRequest: AuthorizationCodeRequest = {
    code: query.code as string,
    scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"],
    redirectUri: "http://localhost:3000/api/microsoft-redirect",
    codeVerifier: req.session.pkceCodes!.verifier,
    clientInfo: query.client_info as string,
  };
  return tokenRequest
}

//================================================
// Silently refresh the Microsoft Access Token if
// possible.
//================================================

export const silentlyRefreshToken = async (token_cache: string) => {
  const client = getNewMicrosoftClient()
  client.getTokenCache().deserialize(token_cache)
  const accounts = await client.getTokenCache().getAllAccounts()

  const tokenRequest: SilentFlowRequest = {
    account: accounts[0],
    scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"]
  }
  await client.acquireTokenSilent(tokenRequest).then(() => {
  }).catch((error) => {
    throw new Error(error)
  })
  return client
}

export const getNewMicrosoftClient = (): ConfidentialClientApplication => {
  return new ConfidentialClientApplication(config)
}

export const confidentialClient = new ConfidentialClientApplication(config)

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
  return token
}
