"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_google_auth_client = get_google_auth_client;
exports.get_google_auth_url_email = get_google_auth_url_email;
exports.get_google_auth_url_imap = get_google_auth_url_imap;
exports.get_google_auth_tokens = get_google_auth_tokens;
exports.set_credentials_on_client = set_credentials_on_client;
exports.get_user_email = get_user_email;
const googleapis_1 = require("googleapis");
//========================================
// Get a new Google Auth Client with required credentials
// GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET need to be set
// in environment varables.
//========================================
function get_google_auth_client() {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/oauth2callback');
    return oauth2Client;
}
;
//========================================
// Get the Google Auth URL for Tapio.
// This is used to return the Google Auth code.
//========================================
function get_google_auth_url_email(client, state) {
    const url = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ['email', 'https://mail.google.com/'],
        state: state,
        include_granted_scopes: true
    });
    return url;
}
;
function get_google_auth_url_imap(client) {
    const url = client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: 'mail.google.com',
        include_granted_scopes: true
    });
    return url;
}
;
//=========================================
// Read the Google Auth code and get tokens.
//=========================================
async function get_google_auth_tokens(client, code) {
    let { tokens } = await client.getToken(code);
    return tokens;
}
;
//========================================
// Set Credentials on Google Auth Client.
//========================================
function set_credentials_on_client(client, tokens) {
    client.setCredentials(tokens);
    return client;
}
//=======================================
// Get user email from the provided tokens.
//=======================================
async function get_user_email(client, id_token) {
    const ticket = await client.verifyIdToken({
        idToken: id_token
    });
    const payload = ticket.getPayload();
    const email = payload === null || payload === void 0 ? void 0 : payload.email;
    return email;
}
;
