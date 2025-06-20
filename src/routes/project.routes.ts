import express from "express";
import {
  createProjectController,
  updateLastLoginController,
  updateProjectFilters,
  getProjectEmails,
} from "../controllers/project.controller";
import requireAuth from "../middleware/require-auth";
import { handleGetProjectsByUserId } from "../controllers/project.controller";

const router = express.Router();

router.post("/projects", requireAuth, createProjectController);
router.get("/projects/emails", requireAuth, getProjectEmails);
router.get("/user-projects", requireAuth, handleGetProjectsByUserId);
router.patch("/projects/:projectId/last-login", updateLastLoginController);
router.patch("/projects/filters", updateProjectFilters);


export default router;
