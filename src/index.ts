import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import url from 'url';
import { randomBytes } from 'node:crypto';
import { get_google_auth_client, get_google_auth_tokens, get_google_auth_url_email } from './services/imap';
const session = require('express-session')

dotenv.config()

// Extend express-session SessionData type to accept state variable.
declare module 'express-session' {
  interface SessionData {
    state: string;
  }
}

type Tokens = {
  tokens: string
}

// Initialize the app
const app: Application = express();
const port = process.env.PORT || 3000;
const client = get_google_auth_client()

// The session middleware will be used to validate requests with a state variable.
// This variable is a 32 byte hex string and is sent to the google oauth2 server.
app.use(session({
  // TODO: Implement a real session secret.
  secret: 'testsecret',
  resave: false,
  saveUninitialized: false
}));

app.get('/', async function(req: Request, res: Response) {
  // This state is included in the authentication url to reduce the risk of CSRF attacks
  const state = randomBytes(32).toString('hex');
  req.session.state = state;

  // Build the Google Auth url.
  const url = get_google_auth_url_email(client, state)

  res.send(`Welcome to Tapio, <a href=${url}>Connect to google?</a>`);
})

// oauth2 callback uri for processing the users email from google oAuth2
app.get('/oauth2callback', async (req: Request, res: Response) => {
  const q = url.parse(req.url || '', true).query;

  if (q.error) {
    console.log('Error: ' + q.error)
  } else if (q.state !== req.session.state) {
    console.log('State Mismatch.  Possible CSRF attack. Rejecting.')
    res.end('State Mismatch. Possible CSRF attack. Rejecting.')
  } else {
    //====================================================================================================
    // Typescript is finicky about passing in strings that may not exist or may be empty.
    // The ? means code may be undefined. We force it to a string so it isn't a string[] type
    // Google also occasionally encodes the access code and replaces any instances of / 'with %2F'
    // the || '' is because the function needs to recieve a string so we tell TS it'll be an empty string
    // if we really screwed up.
    //====================================================================================================
    const { tokens } = await client.getToken(q.code?.toString().replace('%2F', '/') || '');
    const { email } = await client.getTokenInfo(tokens.access_token?.toString() || '')
    console.log(tokens);
    console.log(email)
    res.send(`Lets see if that worked! ${email}`)
  }
}
)

app.listen(port, () => {
  console.log('Server running on https://localhost:${port}')
})
