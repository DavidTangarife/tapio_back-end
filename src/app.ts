import express, { Application } from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import errorHandler from "./middleware/error-handler";
import googleRouter from "./routes/google.routes";
import userRoutes from "./routes/user.routes";
import emailRoutes from "./routes/email.routes";
import microsoftRouter from "./routes/microsoft.routes";
import opportunityRoutes from "./routes/opportunity.routes";
import statusRoutes from "./routes/status.routes";
import testAuth from "./routes/auth.route";
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

export default function createApp(): Application {
  console.time("Create App Func");
  const app: Application = express();
  const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    databaseName: 'test',
    collection: 'sessions'
  })
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());

  //======================================================
  // The session middleware will be used to validate
  // requests with a state variable.
  //
  // This variable is a 32 byte hex string and is
  // sent to the oauth2 server.
  //======================================================
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax", //For OAuth redirects
      },
    })
  );

  //=======================
  //        ROUTES
  //=======================
  app.use("/api", projectRoutes);
  app.use("/api", googleRouter);
  app.use("/api", microsoftRouter);
  app.use("/api", testAuth);
  app.use("/api", userRoutes);
  app.use("/api", emailRoutes);
  app.use("/api", opportunityRoutes);
  app.use("/api", statusRoutes);
  //===================================================
  // Error Handling Middleware
  //
  // WARN: Please place all other app.use() above this.
  // Error middleware needs to be last in the chain.
  //
  //===================================================
  app.use(errorHandler);
  console.timeEnd("Create App Func");
  return app;
}
