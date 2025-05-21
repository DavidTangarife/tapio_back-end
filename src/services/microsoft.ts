import {
  PublicClientApplication,
  AuthorizationCodeRequest,
  LogLevel,
  CryptoProvider,
  AuthorizationUrlRequest,
  Configuration,
  ConfidentialClientApplication,
} from "@azure/msal-node"
import { Request, Response, NextFunction } from "express"
import "dotenv"
import { RequestWithPKCE } from "../types/microsoft";
const msal = require('@azure/msal-node');
const baseconfig = require('../config/msconfig.json')
const axios = require('axios');


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

class AuthProvider {
  config;
  cryptoProvider;

  constructor(config: Configuration) {
    this.config = config;
    this.cryptoProvider = new msal.CryptoProvider();
  }

  getMsalInstance(msalConfig: Configuration) {
    return new msal.ConfidentialClientApplication(msalConfig);
  }

  async login(req: Request, res: Response, next: NextFunction, options = {}) {
    req.session.csrfToken = this.cryptoProvider.createNewGuid();

    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken: req.session.csrfToken,
        redirectTo: '/',
      })
    );

    const authCodeUrlRequestParams = {
      state: state,
      scopes: ['https://outlook.office.com/IMAP.AccessAsUser.All'],
    };

    const authCodeRequestParams = {
      state: state,
      scopes: ['https://outlook.office.com/IMAP.AccessAsUser.All'],
    };

    if (!this.config.auth.authorityMetadata) {
      const authorityMetadata = await this.getAuthorityMetadata();
      this.config.auth.authorityMetadata = JSON.stringify(authorityMetadata);
    }

    const msalInstance = this.getMsalInstance(this.config);

    return this.redirectToAuthCodeUrl(
      req,
      res,
      next,
      authCodeUrlRequestParams,
      authCodeRequestParams,
      msalInstance
    );
  }

  async handleRedirect(req: Request, res: Response, next: NextFunction) {
    const authCodeRequest = {
      ...req.session.authCodeRequest,
      code: req.query.code,
      codeVerifier: req.session.pkceCodes.verifier
    }

    try {
      const msalInstance = this.getMsalInstance(this.config);
      msalInstance.getTokenCache().deserialize(req.session.tokenCache)

      const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body);

      req.session.tokenCache = msalInstance.getTokenCache().serialize();
      req.session.idToken = tokenResponse.idToken;
      req.session.account = tokenResponse.account;
      req.session.access = tokenResponse.accessToken;
      req.session.isAuthenticated = true;

      console.log(req.session.access)
      console.log(req.session.account)
      const state = await JSON.parse(this.cryptoProvider.base64Decode(req.query.state));
      res.redirect(state.redirectTo)
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const logoutUri = `${this.config.auth.authority}tapioapp.onmicrosoft.com/oauth2/v2.0/logout?post_logout_redirect_uri=http://localhost:3000`;

    req.session.destroy(() => {
      res.redirect(logoutUri)
    });
  }

  async redirectToAuthCodeUrl(req: Request, res: Response, next: NextFunction, authCodeUrlRequestParams: any, authCodeRequestParams: any, msalInstance: any) {
    const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();

    req.session.pkceCodes = {
      challengeMethod: 'S256',
      verifier: verifier,
      challenge: challenge,
    };

    req.session.authCodeUrlRequest = {
      ...authCodeUrlRequestParams,
      redirectUri: 'http://localhost:3000/microsoftoauth2callback',
      codeChallenge: req.session.pkceCodes.challenge,
      codeChallengeMethod: req.session.pkceCodes.challengeMethod,
    }

    req.session.authCodeRequest = {
      ...authCodeRequestParams,
      redirectUri: 'http://localhost:3000/microsoftoauth2callback',
      code: '',
    }

    try {
      const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);
      res.redirect(authCodeUrlResponse);
    } catch (error) {
      next(error);
    }
  }

  async getAuthorityMetadata() {
    const endpoint = `${this.config.auth.authority}tapioapp.onmicrosoft.com/v2.0/.well-known/openid-configuration`;
    console.log('Here he is')
    try {
      const response = await axios.get(endpoint);
      return await response.data;
    } catch (error) {
      console.log('Here he is, THE ERROR')
      console.log(error);
      console.log('Here he is, THE ERROR')
    }
  }
}

export const authProvider = new AuthProvider(config);

export const confidentialClient = new ConfidentialClientApplication(config)
