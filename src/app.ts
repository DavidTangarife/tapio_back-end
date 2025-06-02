import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import userRoutes from "./routes/user.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", projectRoutes);
app.use("/api", userRoutes );

export default app;
