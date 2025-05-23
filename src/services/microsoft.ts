import {
  LogLevel,
  Configuration,
  ConfidentialClientApplication,
} from "@azure/msal-node"
import "dotenv"


const config: Configuration = {
  auth: {
    clientId: "bf527d5e-3aeb-4d2f-a04d-152004a014dc",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authority: 'https://login.microsoftonline.com/consumers/',
  },
  system: {
    loggerOptions: {
      loggerCallback(
        loglevel: LogLevel,
        message: string,
        containsPii: boolean
      ) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    },
  },
};

export const confidentialClient = new ConfidentialClientApplication(config)
