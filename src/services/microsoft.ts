import {
  LogLevel,
  Configuration,
  ConfidentialClientApplication,
  CryptoProvider,
  AuthorizationUrlRequest,
  AuthorizationCodeRequest,
} from "@azure/msal-node"
import "dotenv"
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

export const getNewMicrosoftClient = (): ConfidentialClientApplication => {
  return new ConfidentialClientApplication(config)
}

export const confidentialClient = new ConfidentialClientApplication(config)
