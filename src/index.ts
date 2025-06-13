import { Request, Response, Application } from "express";
import mongoose from "mongoose";
import createApp from "./app";
import { config } from "dotenv";
import { MongoClientOptions } from "mongodb";

config();

const MONGO_URL = process.env.MONGO_URL;
// This use the value from the environment variable MONGO_URL, but if it’s undefined,
// use the default string 'mongodb://mongo:27017/mydb' instead.
// It ensure the App works in different environments, in this case is useful for
// local development as the env variable is just set on the dockerfile.

if (!MONGO_URL) {
  throw new Error("Environment variable MONGO_URL must be defined!");
}

// Initialize the app
console.time('Create App')
const app: Application = createApp();
console.timeEnd('Create App')
const port = process.env.PORT || 3000;

app.get("/", async function(req: Request, res: Response) {
  res.send(
    `Welcome to Tapio, I'd love to help but I'm an API! Please call me correctly`
  );
});

const MONGO_OPTIONS: MongoClientOptions = { connectTimeoutMS: 3600000, minPoolSize: 10 }

mongoose.connect(MONGO_URL, MONGO_OPTIONS).then(() => {
  console.log("MongoDB connected");
  app.listen(port, () => {
    console.log(
      `Tapio is ready to rock your socks off on http://localhost:${port}`
    );
    console.log("Hey, You, Yes you, its all gonna be ok! YOU GOT THIS!");
  });
});
