import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import errorHandler from "./middleware/error-handler";
import googleRouter from "./routes/google.routes";
const session = require("express-session");

export default function createApp(): Application {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());
  // The session middleware will be used to validate requests with a state variable.
  // This variable is a 32 byte hex string and is sent to the google oauth2 server.
  app.use(
    session({
      // TODO: Implement a real session secret.
      secret: "testsecret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use("/api", projectRoutes);
  app.use("/api", googleRouter)
  app.use(errorHandler)
  return app;
}
