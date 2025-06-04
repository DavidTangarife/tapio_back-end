import express, { Request, Response, Application, NextFunction } from "express";
import dotenv from "dotenv";
import url from "url";
import { randomBytes } from "node:crypto";
import {
  get_google_auth_client,
  get_google_auth_url_email,
} from "./services/google";
import { get_xoauth2_generator } from "./services/xoauth2";
import {
  get_imap_connection,
  get_imap_connection_ms,
  sender_and_subject_since_date_callback,
} from "./services/imap";
import { confidentialClient } from "./services/microsoft";
import { Session } from "express-session";
import {
  AuthorizationCodeRequest,
  AuthorizationUrlRequest,
  ConfidentialClientApplication,
  CryptoProvider,
  SilentFlowRequest,
} from "@azure/msal-node";
import Connection from "node-imap";
import { OAuth2Client } from "googleapis-common";
import mongoose from "mongoose";
import { getEmailsByProject } from "./services/email.services";
import createApp from "./app";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
// This use the value from the environment variable MONGO_URL, but if it’s undefined,
// use the default string 'mongodb://mongo:27017/mydb' instead.
// It ensure the App works in different environments, in this case is useful for
// local development as the env variable is just set on the dockerfile.

if (!MONGO_URL) {
  throw new Error("Environment variable MONGO_URL must be defined!");
}

// Extend express-session SessionData type to accept state variable.
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

declare global {
  namespace Express {
    interface RequestWithPKCE extends Request {
      session: Session & {
        pkceCodes: {
          challengeMethod: string;
          challenge?: string;
          verifier?: string;
        };
      };
    }
  }
}

// Initialize the app
const app: Application = createApp();
const port = process.env.PORT || 3000;
const google_client: OAuth2Client = get_google_auth_client();
const microsoft_client: ConfidentialClientApplication = confidentialClient;


app.get("/", async function(req: Request, res: Response, next: NextFunction) {
  // This state is included in the authentication url to reduce the risk of CSRF attacks
  const state: string = randomBytes(32).toString("hex");
  req.session.state = state;

  // Build the Google Auth url.
  const url = get_google_auth_url_email(google_client, state);
  res.send(
    `Welcome to Tapio, <br><a href=${url}>Connect to google?</a><br><a href='/microsoftsignin'>Connect to Microsoft</a>`
  );
});

// oauth2 callback uri for processing the users email from google oAuth2
app.get("/oauth2callback", async (req: Request, res: Response) => {
  const q = url.parse(req.url || "", true).query;

  if (q.error) {
    console.log("Error: " + q.error);
  } else if (q.state !== req.session.state) {
    console.log("State Mismatch.  Possible CSRF attack. Rejecting.");
    res.end("State Mismatch. Possible CSRF attack. Rejecting.");
  } else {
    //====================================================================================================
    // Typescript is finicky about passing in strings that may not exist or may be empty.
    // The ? means code may be undefined. We force it to a string so it isn't a string[] type
    // Google also occasionally encodes the access code and replaces any instances of / 'with %2F'
    // the || '' is because the function needs to recieve a string so we tell TS it'll be an empty string
    // if we really screwed up.
    //====================================================================================================
    if (q.code !== undefined) {
      const { tokens } = await google_client.getToken(
        q.code.toString().replace("%2F", "/")
      );
      const { email } = await google_client.getTokenInfo(
        tokens.access_token?.toString() || ""
      );

      const generator = get_xoauth2_generator(
        email || "",
        tokens.refresh_token || "",
        tokens.access_token || ""
      );

      let date: Date = new Date();
      date.setDate(date.getDate() - 14);
      console.log(date);
      generator.getToken((err: string, token: string) => {
        if (err) {
          console.log(err);
        }
        console.log(token);
        const connection: Connection = get_imap_connection(email || "", token);
        sender_and_subject_since_date_callback(
          connection,
          date.toISOString(),
          res
        );
        connection.connect();
      });
    }
  }
});

app.get('/microtest', async (req: any, res: any) => {
  microsoft_client.getTokenCache().deserialize(JSON.stringify('** Token Cache here **'))
  const acc = await microsoft_client.getTokenCache().getAllAccounts()
  console.log("Account")
  console.log(acc)
  const tokenRequest: SilentFlowRequest = {
    account: acc[0],
    scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"]
  };
  microsoft_client.acquireTokenSilent(tokenRequest).then((response) => {
    console.log('Response')
    console.log(response)
    const accessToken: string = Buffer.from(
      "user=" +
      response.account!.username +
      "\x01auth=Bearer " +
      response.accessToken +
      "\x01\x01"
    ).toString("base64");
    const connection: Connection = get_imap_connection_ms(
      response.account!.username || "",
      accessToken
    );
    console.log(connection)
    let date: Date = new Date();
    date.setDate(date.getDate() - 7);
    sender_and_subject_since_date_callback(
      connection,
      date.toISOString(),
      res
    );
    connection.connect();
  }).catch((error) => {
    console.log('Error')
    console.log(error)
  })
})

app.get("/microsoftsignin", (req: RequestWithPKCE, res: any) => {
  const cryptoProvider = new CryptoProvider();
  cryptoProvider.generatePkceCodes().then(({ verifier, challenge }) => {
    if (!req.session.pkceCodes) {
      req.session.pkceCodes = {
        challengeMethod: "S256",
      };
    }
    const state: string = randomBytes(32).toString("hex");
    req.session.state = state;
    req.session.pkceCodes.verifier = verifier;
    req.session.pkceCodes.challenge = challenge;

    const authCodeUrlParameters: AuthorizationUrlRequest = {
      scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"],
      redirectUri: "http://localhost:3000/microsoftoauth2callback",
      codeChallenge: req.session.pkceCodes.challenge,
      codeChallengeMethod: req.session.pkceCodes.challengeMethod,
      state: state,
    };

    microsoft_client.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
      res.redirect(response);
    });
  });
});

app.get("/microsoftoauth2callback", (req: Request, res: Response) => {
  const query = req.query;
  if (req.session.state !== query.state) {
    console.log("State Mismatch.  Possible CSRF attack. Rejecting.");
    res.end("State Mismatch. Possible CSRF attack. Rejecting.");
  } else {
    const tokenRequest: AuthorizationCodeRequest = {
      code: query.code as string,
      scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"],
      redirectUri: "http://localhost:3000/microsoftoauth2callback",
      codeVerifier: req.session.pkceCodes!.verifier,
      clientInfo: query.client_info as string,
    };

    microsoft_client.acquireTokenByCode(tokenRequest).then((token) => {
      console.log(token)
      const accessToken: string = Buffer.from(
        "user=" +
        token.account!.username +
        "\x01auth=Bearer " +
        token.accessToken +
        "\x01\x01"
      ).toString("base64");
      const cache = microsoft_client.getTokenCache().serialize()
      console.log(cache)
      const connection: Connection = get_imap_connection_ms(
        token.account!.username || "",
        accessToken
      );
      let date: Date = new Date();
      date.setDate(date.getDate() - 7);
      sender_and_subject_since_date_callback(
        connection,
        date.toISOString(),
        res
      );
      connection.connect();
    });
  }
});

app.get("/getemails", async (req: Request, res: Response) => {
  const emails: any = await getEmailsByProject("682efb5211da37c9c95e0779");
  res.send(emails)
})

mongoose.connect(MONGO_URL).then(() => {
  console.log("MongoDB connected");
  app.listen(port, () => {
    console.log(
      `Tapio is ready to rock your socks off on https://localhost:${port}`
    );
    console.log("Hey, You, Yes you, its all gonna be ok! YOU GOT THIS!");
  });
});
