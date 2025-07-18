import axios from 'axios';
import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { Types } from 'mongoose'
import Email, { IEmail } from '../models/email.model'
import { emailInfo } from '../types/email';
import { createTransport, Transporter } from 'nodemailer';

google.options({
  http2: false
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

export const getGmailApi = async (refresh_token: string, projectId: Types.ObjectId, date: Date) => {
  //===============================
  // Setup Google Auth
  //===============================
  const auth_client = get_google_auth_client();
  auth_client.setCredentials({ refresh_token: refresh_token })
  const { token } = await auth_client.getAccessToken()

  //===========================================
  // Setup gmail client and get list of emails
  // to fetch
  // WARN: Currently set to limit to 5 emails for testing purposes 
  //
  //===========================================
  const gmail = google.gmail({ version: 'v1', auth: auth_client });
  const query = `after:${date.getTime().toString().substring(0, 10)}`
  const emails = await gmail.users.messages.list({ userId: 'me', maxResults: 1000, q: query })
  console.log(emails)
  let payload: string[] = (emails.data.messages! || []).map((x) => x.id!.toString())
  const email_list: any[] = [];

  //===========================================
  // Since some requests fail we will do this
  // in batches.  Any failed emails are
  // appended to the end of our list of emails
  // to get so they are tried again at the end.
  // 
  // TODO: Add an attempt limiter/timeout.
  //
  //===========================================
  while (payload.length !== 0) {
    let failed: any = []

    //=========================================
    // Each attempt is a promise so we can
    // await it's execution.
    //=========================================
    const cycle = new Promise((resolve) => setTimeout(async () => {
      //=======================================
      // Size of the batch of request.
      // Recommended size is < 100
      //=======================================
      const slice = payload.splice(0, 100)
      //=======================================
      // Get the batch response and cut up the 
      // inidividual responses.
      //=======================================
      const response = await batchGetEmails(slice, token!)
      const responses = response.data.split('--batch')
      for (const i of responses) {
        //=====================================
        // Turn the http response into an Array
        //=====================================
        const clean = i.split('\r\n\r\n')[2]

        if (clean !== undefined) {
          //========================
          // Extract important data
          //========================
          const { id, snippet, payload } = JSON.parse(clean)

          //============================
          // If email was valid
          // extract more important data
          //============================
          if (payload !== undefined) {
            console.log(payload)
            const from = payload.headers.find((x: any) => x.name === 'From')?.value
            const subject = payload.headers.find((x: any) => x.name === 'Subject')?.value
            const date = payload.headers.find((x: any) => x.name === 'Date')?.value
            const threadId = payload.headers.find((x: any) => x.name === 'Message-ID')?.value
            email_list.push({ mailBoxId: id, snippet, from, subject, projectId, date, threadId })
          }
          //==============================
          // Otherwise request failed.
          // This request will be retried
          // at the end.
          //==============================
          if (id === undefined) {
            console.log(clean)
            failed.push(i.split('\r\n\r\n')[0].split('response-')[1])
          }
        }
      }
      //Exit the promise.
      resolve('');
    }, 1000))
    //============================
    // Do one attempted Batch then
    // add the failed responses to
    // the end of the list to 
    // process
    //============================
    await cycle;
    payload.push(...failed)
  }
  return email_list
}

//=========================================
// This builds a multipart/mixed response
// so we can send a batch of requests to
// the gmail api.
//=========================================
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

export const sendGmailEmail = async (user_email: string, refresh_token: string, body: any) => {
  const { message, to, inReplyTo, subject, replyChunk } = body
  const auth_client = get_google_auth_client();
  auth_client.setCredentials({ refresh_token: refresh_token })
  const { token } = await auth_client.getAccessToken()

  const transport: Transporter = await createNodemailerTransport(user_email, token!)
  const rawTohtml = rawToHTML(message, replyChunk)
  const cleanedSubject = subject.startsWith("Re: ") ? subject : "Re: " + subject;

  const send = await transport.sendMail({
    from: "Jacob Phelan <jacobsdevsmail@gmail.com>",
    to,
    subject: cleanedSubject,
    text: message,
    html: rawTohtml,
    inReplyTo: inReplyTo + '@gmail.com',
    references: [inReplyTo + '@gmail.com']
  });
  console.log("Sent ", send)
}

const createNodemailerTransport = async (user_email: string, access_token: string) => {
  const transport: Transporter = createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: user_email,
      accessToken: access_token
    },
  });
  return transport
}

const rawToHTML = (input: string, replyChunk: string) => {
  let string = `<p>${input}</p>`
  string = string.split('\n').join('<br>')
  string = '<div dir="auto">' + string + '</div><br>' + replyChunk
  return string
}
