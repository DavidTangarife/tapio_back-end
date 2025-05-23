import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = 5000;
const MONGO_URL = process.env.MONGO_URL;
// This use the value from the environment variable MONGO_URL, but if it’s undefined,
// use the default string 'mongodb://mongo:27017/mydb' instead.
// It ensure the App works in different environments, in this case is useful for
// local development as the env variable is just set on the dockerfile.

if (!MONGO_URL) {
  throw new Error("Environment variable MONGO_URL must be defined!");
}

mongoose.connect(MONGO_URL).then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
});
