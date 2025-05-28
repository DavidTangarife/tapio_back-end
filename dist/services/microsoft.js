"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confidentialClient = void 0;
const msal_node_1 = require("@azure/msal-node");
require("dotenv");
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
exports.confidentialClient = new msal_node_1.ConfidentialClientApplication(config);
