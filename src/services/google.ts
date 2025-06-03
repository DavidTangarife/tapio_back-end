import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { get_xoauth2_generator } from './xoauth2';
import { access } from 'node:fs';
import { get_imap_connection } from './imap';
import Connection from 'node-imap';

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
