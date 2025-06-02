import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import userRoutes from "./routes/user.routes";
import emailRoutes from "./routes/email.routes";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", projectRoutes);
app.use("/api", userRoutes );
app.use("/api", emailRoutes);

export default app;
