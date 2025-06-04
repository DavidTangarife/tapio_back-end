import { Session } from 'express-session'
import { Request } from 'express';

declare module "express-session" {
  interface SessionData {
    state: string;
    csrfToken?: string;
    authCodeRequest?: string;
    pkceCodes?: Record<string, string>;
    tokenCache?: any;
    idToken?: any;
    account?: any;
    access?: any;
    refresh?: any;
    isAuthenticated?: boolean;
    authCodeUrlRequest?: any;
    user_id?: ObjectId;
  }
}

type RequestWithPKCE = Request & {
  session: Session & {
    pkceCodes: {
      challengeMethod: string;
      challenge?: string;
      verifier?: string;
    };
  };
};

type RequestWithSession = Request & {
  session?: SessionData
}

declare module "connect-mongodb-session";