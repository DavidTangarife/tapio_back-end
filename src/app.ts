import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import errorHandler from "./middleware/error-handler";
import googleRouter from "./routes/google.routes";
import testAuth from "./routes/auth.route";

const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);

export default function createApp(): Application {
  const app: Application = express();
  const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions'
  })
  app.use(cors());
  app.use(express.json());
  // The session middleware will be used to validate requests with a state variable.
  // This variable is a 32 byte hex string and is sent to the google oauth2 server.
  app.use(
    session({
      // TODO: Implement a real session secret.
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax" //For OAuth redirects
      }
    })
  );

  app.use("/api", googleRouter)
  app.use("/api", projectRoutes);
  app.use("/api", testAuth);
  app.use(errorHandler)
  return app;
}
