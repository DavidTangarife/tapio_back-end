import express from "express";
import { createProjectController, getProjectEmails, updateLastLoginController } from "../controllers/project.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/projects", requireAuth, createProjectController);
router.get("/projects/emails", requireAuth, getProjectEmails);
router.patch("/projects/:projectId/last-login", updateLastLoginController);

export default router;
