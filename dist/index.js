"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const url_1 = __importDefault(require("url"));
const node_crypto_1 = require("node:crypto");
const google_1 = require("./services/google");
const xoauth2_1 = require("./services/xoauth2");
const session = require('express-session');
dotenv_1.default.config();
// Initialize the app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const client = (0, google_1.get_google_auth_client)();
// The session middleware will be used to validate requests with a state variable.
// This variable is a 32 byte hex string and is sent to the google oauth2 server.
app.use(session({
    // TODO: Implement a real session secret.
    secret: 'testsecret',
    resave: false,
    saveUninitialized: false
}));
app.get('/', async function (req, res) {
    // This state is included in the authentication url to reduce the risk of CSRF attacks
    const state = (0, node_crypto_1.randomBytes)(32).toString('hex');
    req.session.state = state;
    // Build the Google Auth url.
    const url = (0, google_1.get_google_auth_url_email)(client, state);
    res.send(`Welcome to Tapio, <a href=${url}>Connect to google?</a>`);
});
// oauth2 callback uri for processing the users email from google oAuth2
app.get('/oauth2callback', async (req, res) => {
    var _a;
    const q = url_1.default.parse(req.url || '', true).query;
    if (q.error) {
        console.log('Error: ' + q.error);
    }
    else if (q.state !== req.session.state) {
        console.log('State Mismatch.  Possible CSRF attack. Rejecting.');
        res.end('State Mismatch. Possible CSRF attack. Rejecting.');
    }
    else {
        //====================================================================================================
        // Typescript is finicky about passing in strings that may not exist or may be empty.
        // The ? means code may be undefined. We force it to a string so it isn't a string[] type
        // Google also occasionally encodes the access code and replaces any instances of / 'with %2F'
        // the || '' is because the function needs to recieve a string so we tell TS it'll be an empty string
        // if we really screwed up.
        //====================================================================================================
        if (q.code !== undefined) {
            const { tokens } = await client.getToken(q.code.toString().replace('%2F', '/'));
            const { email } = await client.getTokenInfo(((_a = tokens.access_token) === null || _a === void 0 ? void 0 : _a.toString()) || '');
            const generator = (0, xoauth2_1.get_xoauth2_generator)(email || '', tokens.refresh_token || '', tokens.access_token || '');
            const token = await generator.getToken(function (err, token) { return token; });
            setTimeout(function () { res.send(`Lets see if that worked! Your email is: ${email}<br>Your xoauth2token is ${token}`); }, 0);
        }
    }
});
app.listen(port, () => {
    console.log('Server running on https://localhost:${port}');
});
