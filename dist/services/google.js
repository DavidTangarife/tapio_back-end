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
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_google_auth_client = get_google_auth_client;
exports.get_google_auth_url_email = get_google_auth_url_email;
exports.get_google_auth_url_imap = get_google_auth_url_imap;
exports.get_google_auth_tokens = get_google_auth_tokens;
exports.set_credentials_on_client = set_credentials_on_client;
exports.get_user_email = get_user_email;
exports.processGoogleCode = processGoogleCode;
const googleapis_1 = require("googleapis");
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
