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
const dotenv_1 = __importDefault(require("dotenv"));
const url_1 = __importDefault(require("url"));
const node_crypto_1 = require("node:crypto");
const google_1 = require("./services/google");
const xoauth2_1 = require("./services/xoauth2");
const imap_1 = require("./services/imap");
const microsoft_1 = require("./services/microsoft");
const msal_node_1 = require("@azure/msal-node");
const mongoose_1 = __importDefault(require("mongoose"));
const email_services_1 = require("./services/email.services");
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const MONGO_URL = process.env.MONGO_URL;
// This use the value from the environment variable MONGO_URL, but if it’s undefined,
// use the default string 'mongodb://mongo:27017/mydb' instead.
// It ensure the App works in different environments, in this case is useful for
// local development as the env variable is just set on the dockerfile.
if (!MONGO_URL) {
    throw new Error("Environment variable MONGO_URL must be defined!");
}
// Initialize the app
const app = (0, app_1.default)();
const port = process.env.PORT || 3000;
const google_client = (0, google_1.get_google_auth_client)();
const microsoft_client = microsoft_1.confidentialClient;
app.get("/", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // This state is included in the authentication url to reduce the risk of CSRF attacks
        const state = (0, node_crypto_1.randomBytes)(32).toString("hex");
        req.session.state = state;
        // Build the Google Auth url.
        const url = (0, google_1.get_google_auth_url_email)(google_client, state);
        res.send(`Welcome to Tapio, <br><a href=${url}>Connect to google?</a><br><a href='/microsoftsignin'>Connect to Microsoft</a>`);
    });
});
// oauth2 callback uri for processing the users email from google oAuth2
app.get("/oauth2callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const q = url_1.default.parse(req.url || "", true).query;
    if (q.error) {
        console.log("Error: " + q.error);
    }
    else if (q.state !== req.session.state) {
        console.log("State Mismatch.  Possible CSRF attack. Rejecting.");
        res.end("State Mismatch. Possible CSRF attack. Rejecting.");
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
            const { tokens } = yield google_client.getToken(q.code.toString().replace("%2F", "/"));
            const { email } = yield google_client.getTokenInfo(((_a = tokens.access_token) === null || _a === void 0 ? void 0 : _a.toString()) || "");
            const generator = (0, xoauth2_1.get_xoauth2_generator)(email || "", tokens.refresh_token || "", tokens.access_token || "");
            let date = new Date();
            date.setDate(date.getDate() - 14);
            console.log(date);
            generator.getToken((err, token) => {
                if (err) {
                    console.log(err);
                }
                console.log(token);
                const connection = (0, imap_1.get_imap_connection)(email || "", token);
                (0, imap_1.sender_and_subject_since_date_callback)(connection, date.toISOString(), res);
                connection.connect();
            });
        }
    }
}));
app.get('/microtest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    microsoft_client.getTokenCache().deserialize(JSON.stringify('** Token Cache here **'));
    const acc = yield microsoft_client.getTokenCache().getAllAccounts();
    console.log("Account");
    console.log(acc);
    const tokenRequest = {
        account: acc[0],
        scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"]
    };
    microsoft_client.acquireTokenSilent(tokenRequest).then((response) => {
        console.log('Response');
        console.log(response);
        const accessToken = Buffer.from("user=" +
            response.account.username +
            "\x01auth=Bearer " +
            response.accessToken +
            "\x01\x01").toString("base64");
        const connection = (0, imap_1.get_imap_connection_ms)(response.account.username || "", accessToken);
        console.log(connection);
        let date = new Date();
        date.setDate(date.getDate() - 7);
        (0, imap_1.sender_and_subject_since_date_callback)(connection, date.toISOString(), res);
        connection.connect();
    }).catch((error) => {
        console.log('Error');
        console.log(error);
    });
}));
app.get("/microsoftsignin", (req, res) => {
    const cryptoProvider = new msal_node_1.CryptoProvider();
    cryptoProvider.generatePkceCodes().then(({ verifier, challenge }) => {
        if (!req.session.pkceCodes) {
            req.session.pkceCodes = {
                challengeMethod: "S256",
            };
        }
        const state = (0, node_crypto_1.randomBytes)(32).toString("hex");
        req.session.state = state;
        req.session.pkceCodes.verifier = verifier;
        req.session.pkceCodes.challenge = challenge;
        const authCodeUrlParameters = {
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
app.get("/microsoftoauth2callback", (req, res) => {
    const query = req.query;
    if (req.session.state !== query.state) {
        console.log("State Mismatch.  Possible CSRF attack. Rejecting.");
        res.end("State Mismatch. Possible CSRF attack. Rejecting.");
    }
    else {
        const tokenRequest = {
            code: query.code,
            scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"],
            redirectUri: "http://localhost:3000/microsoftoauth2callback",
            codeVerifier: req.session.pkceCodes.verifier,
            clientInfo: query.client_info,
        };
        microsoft_client.acquireTokenByCode(tokenRequest).then((token) => {
            console.log(token);
            const accessToken = Buffer.from("user=" +
                token.account.username +
                "\x01auth=Bearer " +
                token.accessToken +
                "\x01\x01").toString("base64");
            const cache = microsoft_client.getTokenCache().serialize();
            console.log(cache);
            const connection = (0, imap_1.get_imap_connection_ms)(token.account.username || "", accessToken);
            let date = new Date();
            date.setDate(date.getDate() - 7);
            (0, imap_1.sender_and_subject_since_date_callback)(connection, date.toISOString(), res);
            connection.connect();
        });
    }
});
app.get("/getemails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emails = yield (0, email_services_1.getEmailsByProject)("682efb5211da37c9c95e0779");
    res.send(emails);
}));
mongoose_1.default.connect(MONGO_URL).then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
        console.log(`Tapio is ready to rock your socks off on https://localhost:${port}`);
        console.log("Hey, You, Yes you, its all gonna be ok! YOU GOT THIS!");
    });
});
