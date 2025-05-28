import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", projectRoutes);

export default app;
