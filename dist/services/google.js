"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGmailApi = void 0;
exports.get_google_auth_client = get_google_auth_client;
exports.get_google_auth_url_email = get_google_auth_url_email;
exports.get_google_auth_url_imap = get_google_auth_url_imap;
exports.get_google_auth_tokens = get_google_auth_tokens;
exports.set_credentials_on_client = set_credentials_on_client;
exports.get_user_email = get_user_email;
exports.processGoogleCode = processGoogleCode;
const axios_1 = __importDefault(require("axios"));
const googleapis_1 = require("googleapis");
googleapis_1.google.options({
    http2: false
});
//========================================
// Get a new Google Auth Client with required credentials
// GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET need to be set
// in environment varables.
//========================================
function get_google_auth_client(url = 'http://localhost:3000/oauth2callback') {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, url);
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
function get_google_auth_tokens(client, code) {
    return __awaiter(this, void 0, void 0, function* () {
        let { tokens } = yield client.getToken(code);
        return tokens;
    });
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
function get_user_email(client, id_token) {
    return __awaiter(this, void 0, void 0, function* () {
        const ticket = yield client.verifyIdToken({
            idToken: id_token
        });
        const payload = ticket.getPayload();
        const email = payload === null || payload === void 0 ? void 0 : payload.email;
        return email;
    });
}
;
function processGoogleCode(code, client) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (code === 'undefined')
            throw new Error('No Google Auth Code found!');
        const { tokens } = yield client.getToken(code.replace("%F", "/"));
        const { email } = yield client.getTokenInfo(((_a = tokens.access_token) === null || _a === void 0 ? void 0 : _a.toString()) || "");
        return Object.assign(Object.assign({}, tokens), { email });
    });
}
const getGmailApi = (refresh_token, access_token, projectId) => __awaiter(void 0, void 0, void 0, function* () {
    //===============================
    // Setup Google Auth
    //===============================
    const auth_client = get_google_auth_client();
    auth_client.setCredentials({ refresh_token: refresh_token });
    //===========================================
    // Setup gmail client and get list of emails
    // to fetch
    //===========================================
    const gmail = googleapis_1.google.gmail({ version: 'v1', auth: auth_client });
    const emails = yield gmail.users.messages.list({ userId: 'me', maxResults: 5 });
    let payload = emails.data.messages.map((x) => x.id.toString());
    const email_list = [];
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
        let failed = [];
        //=========================================
        // Each attempt is a promise so we can
        // await it's execution.
        //=========================================
        const cycle = new Promise((resolve) => setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            //=======================================
            // Size of the batch of request.
            // Recommended size is < 100
            //=======================================
            const slice = payload.splice(0, 100);
            //=======================================
            // Get the batch response and cut up the 
            // inidividual responses.
            //=======================================
            const response = yield batchGetEmails(slice, access_token);
            const responses = response.data.split('--batch');
            for (const i of responses) {
                //=====================================
                // Turn the http response into an Array
                //=====================================
                const clean = i.split('\r\n\r\n')[2];
                if (clean !== undefined) {
                    //========================
                    // Extract important data
                    //========================
                    const { id, snippet, payload, internalDate } = JSON.parse(clean);
                    //============================
                    // If email was valid
                    // extract more important data
                    //============================
                    if (payload !== undefined) {
                        const from = payload.headers.find((x) => x.name === 'From').value;
                        const subject = payload.headers.find((x) => x.name === 'Subject').value;
                        const date = payload.headers.find((x) => x.name === 'Date').value;
                        email_list.push({ mailBoxId: id, from, subject, projectId, date });
                    }
                    //==============================
                    // Otherwise request failed.
                    // This request will be retried
                    // at the end.
                    //==============================
                    if (id === undefined) {
                        console.log(clean);
                        failed.push(i.split('\r\n\r\n')[0].split('response-')[1]);
                    }
                }
            }
            //Exit the promise.
            resolve('');
        }), 1000));
        //============================
        // Do one attempted Batch then
        // add the failed responses to
        // the end of the list to 
        // process
        //============================
        yield cycle;
        payload.push(...failed);
    }
    return email_list;
});
exports.getGmailApi = getGmailApi;
//=========================================
// This builds a multipart/mixed response
// so we can send a batch of requests to
// the gmail api.
//=========================================
const batchGetEmails = (ids, access_token) => __awaiter(void 0, void 0, void 0, function* () {
    const data = ids.map((x) => {
        return `--batch_foobarbaz\r\nContent-Type: application/http\r\nContent-ID: ${x}\r\n\r\nGET https://gmail.googleapis.com/gmail/v1/users/me/messages/${x} HTTP/1.1\r\n\r\n`;
    });
    const streq = data.join('') + '--batch_foobarbaz--';
    const result = axios_1.default.post('https://www.googleapis.com/batch/gmail/v1', streq, {
        headers: {
            'Content-Type': 'multipart/mixed; boundary=batch_foobarbaz',
            'Authorization': 'Bearer ' + access_token,
        }
    });
    return result;
});
