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
exports.buildXOAuth2Token = exports.confidentialClient = exports.getNewMicrosoftClient = exports.silentlyRefreshToken = exports.getTokenRequest = exports.getAuthCodeParams = exports.buildPkceCodes = void 0;
const msal_node_1 = require("@azure/msal-node");
//import { AuthorizationCodeCredential } from "@azure/identity";
const cryptoProvider = new msal_node_1.CryptoProvider();
const config = {
    auth: {
        clientId: "bf527d5e-3aeb-4d2f-a04d-152004a014dc",
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        authority: 'https://login.microsoftonline.com/consumers/',
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal_node_1.LogLevel.Verbose,
        },
    },
};
//==========================================
// Codes that Microsoft will use to validate
// this auth request
//==========================================
const buildPkceCodes = (req) => __awaiter(void 0, void 0, void 0, function* () {
    cryptoProvider.generatePkceCodes().then(({ verifier, challenge }) => {
        if (!req.session.pkceCodes) {
            req.session.pkceCodes = {
                challengeMethod: "S256"
            };
        }
        ;
        req.session.pkceCodes.verifier = verifier;
        req.session.pkceCodes.challenge = challenge;
    });
});
exports.buildPkceCodes = buildPkceCodes;
//===========================================
// Parameters used to build the Microsoft
// auth URL
//===========================================
const getAuthCodeParams = (req) => {
    const authCodeUrlParameters = {
        scopes: ["https://graph.microsoft.com/Mail.Read"],
        redirectUri: "http://localhost:3000/api/microsoft-redirect",
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
        state: req.session.state,
    };
    return authCodeUrlParameters;
};
exports.getAuthCodeParams = getAuthCodeParams;
//==========================================
// Builds the tokenRequest parameters for
// the confidentialClient
//==========================================
const getTokenRequest = (req, query) => {
    const tokenRequest = {
        code: query.code,
        scopes: ["https://graph.microsoft.com/Mail.Read"],
        redirectUri: "http://localhost:3000/api/microsoft-redirect",
        codeVerifier: req.session.pkceCodes.verifier,
        clientInfo: query.client_info,
    };
    return tokenRequest;
};
exports.getTokenRequest = getTokenRequest;
//================================================
// Silently refresh the Microsoft Access Token if
// possible.
//================================================
const silentlyRefreshToken = (token_cache) => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, exports.getNewMicrosoftClient)();
    client.getTokenCache().deserialize(token_cache);
    const accounts = yield client.getTokenCache().getAllAccounts();
    const tokenRequest = {
        account: accounts[0],
        scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"]
    };
    yield client.acquireTokenSilent(tokenRequest).then(() => {
    }).catch((error) => {
        throw new Error(error);
    });
    return client;
});
exports.silentlyRefreshToken = silentlyRefreshToken;
const getNewMicrosoftClient = () => {
    return new msal_node_1.ConfidentialClientApplication(config);
};
exports.getNewMicrosoftClient = getNewMicrosoftClient;
exports.confidentialClient = new msal_node_1.ConfidentialClientApplication(config);
//=====================================================
// Builds an XOAUTH2 token. This is only required if
// accessing IMAP or SMTP server.  API calls shouldn't
// require it.
//=====================================================
const buildXOAuth2Token = (username, accessToken) => {
    const token = Buffer.from("user=" +
        username +
        "\x01auth=Bearer " +
        accessToken +
        "\x01\x01").toString("base64");
    return token;
};
exports.buildXOAuth2Token = buildXOAuth2Token;
/*
export const getGraphClient = async (code: string) => {
  const credential = new AuthorizationCodeCredential(
    'consumers',
    "bf527d5e-3aeb-4d2f-a04d-152004a014dc",
    process.env.MICROSOFT_CLIENT_SECRET!,
    code,
    "http://localhost:3000/api/microsoft-redirect"
  )
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/Mail.Read"]
  })

  const graphClient = Client.initWithMiddleware({ authProvider })
  return graphClient;
}*/
