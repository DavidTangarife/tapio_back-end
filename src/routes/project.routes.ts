import express from "express";
import { createProjectController } from "../controllers/project.controller";

const router = express.Router();

router.post("/projects", createProjectController);

export default router;