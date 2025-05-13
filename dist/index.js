"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const url_1 = __importDefault(require("url"));
const node_crypto_1 = require("node:crypto");
const imap_1 = require("./services/imap");
const session = require('express-session');
dotenv_1.default.config();
// Initialize the app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const client = (0, imap_1.get_google_auth_client)();
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
    const url = (0, imap_1.get_google_auth_url_email)(client, state);
    res.send(`Welcome to Tapio, <a href=${url}>Connect to google?</a>`);
});
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
        let data = {};
        const promise = client.getToken(((_a = q.code) === null || _a === void 0 ? void 0 : _a.toString()) || '');
        promise.then((value) => {
            data = value;
        });
        console.log(data);
    }
});
app.listen(port, () => {
    console.log('Server running on https://localhost:${port}');
});
