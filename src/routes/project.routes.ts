import express from "express";
import { createProjectController, updateLastLoginController } from "../controllers/project.controller";

const router = express.Router();

router.post("/projects", createProjectController);
router.patch("/projects/:projectId/last-login", updateLastLoginController);

export default router;