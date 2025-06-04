import axios from 'axios';
import { google, Auth, batch_v1 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { request } from 'node:https';

google.options({
  http2: true
})
//========================================
// Get a new Google Auth Client with required credentials
// GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET need to be set
// in environment varables.
//========================================
export function get_google_auth_client(url: string = 'http://localhost:3000/oauth2callback') {
  const oauth2Client: Auth.OAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    url
  );
  return oauth2Client;
};

//========================================
// Get the Google Auth URL for Tapio.
// This is used to return the Google Auth code.
//========================================
export function get_google_auth_url_email(client: Auth.OAuth2Client, state: string) {
  const url: string = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ['email', 'https://mail.google.com/'],
    state: state,
    include_granted_scopes: true
  });
  return url;
};

export function get_google_auth_url_imap(client: Auth.OAuth2Client) {
  const url: string = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: 'mail.google.com',
    include_granted_scopes: true
  });
  return url;
};

//=========================================
// Read the Google Auth code and get tokens.
//=========================================
export async function get_google_auth_tokens(client: Auth.OAuth2Client, code: any) {
  let { tokens } = await client.getToken(code);
  return tokens;
};

//========================================
// Set Credentials on Google Auth Client.
//========================================
export function set_credentials_on_client(client: Auth.OAuth2Client, tokens: any) {
  client.setCredentials(tokens);
  return client;
}

//=======================================
// Get user email from the provided tokens.
//=======================================
export async function get_user_email(client: Auth.OAuth2Client, id_token: string) {
  const ticket = await client.verifyIdToken({
    idToken: id_token
  });
  const payload = ticket.getPayload()
  const email = payload?.email
  return email;
};

export async function processGoogleCode(code: string, client: OAuth2Client) {
  if (code === 'undefined') throw new Error('No Google Auth Code found!')
  const { tokens } = await client.getToken(code.replace("%F", "/"))
  const { email } = await client.getTokenInfo(tokens.access_token?.toString() || "")
  return { ...tokens, email }
}

export const getGmailApi = async (refresh_token: string, access_token: string) => {
  const auth_client = get_google_auth_client();
  auth_client.setCredentials({ refresh_token: refresh_token })
  const gmail = google.gmail({ version: 'v1', auth: auth_client });
  const emails = await gmail.users.messages.list({ userId: 'me' })
  const payload: string[] = emails.data.messages!.map((x) => x.id!.toString())
  console.time('timer');
  const response = await batchGetEmails(payload.slice(0, 3), access_token)
  console.log(response)
  console.timeEnd('timer');
}

const batchGetEmails = async (ids: any, access_token: string) => {
  const data: string[] = ids.map((x: any) => {
    return `--batch_foobarbaz\r\nContent-Type: application/http\r\nContent-ID: ${x}\r\n\r\nGET https://gmail.googleapis.com/gmail/v1/users/me/messages/${x} HTTP/1.1\r\n\r\n`
  })
  const streq: string = data.join('') + '--batch_foobarbaz--'
  const result = axios.post(
    'https://www.googleapis.com/batch/gmail/v1',
    streq,
    {
      headers: {
        'Content-Type': 'multipart/mixed; boundary=batch_foobarbaz',
        'Authorization': 'Bearer ' + access_token,
      }
    }
  )
  return result
}

