import { Request, Response, Application } from "express";
import mongoose from "mongoose";
import createApp from "./app";
import { config } from "dotenv";
import { MongoClientOptions } from "mongodb";

config();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("Environment variable MONGO_URL must be defined!");
}

// Initialize the app
const app: Application = createApp();
const port = process.env.PORT || 3000;

app.get("/", async function (req: Request, res: Response) {
  res.send(
    `Welcome to Tapio, I'd love to help but I'm an API! Please call me correctly`
  );
});

mongoose.connect(MONGO_URL!).then(() => {
  console.log("MongoDB connected");
  app.listen(port, () => {
    console.log(
      `Tapio is ready to rock your socks off on http://localhost:${port}`
    );
    console.log("Hey, You, Yes you, its all gonna be ok! YOU GOT THIS!");
  });
});

const gracefulShutdown = async () => {
  console.log("Goodbye");
  await mongoose.disconnect().then(() => {
    console.log("Mongo Disconnected");
  });
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
