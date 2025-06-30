import express from "express";
import {
  createProjectController,
  updateProjectFilters,
  getProjectEmails,
  updateSession,
  getSessionProject,
  deleteProjectById,
} from "../controllers/project.controller";
import requireAuth from "../middleware/require-auth";
import { handleGetProjectsByUserId } from "../controllers/project.controller";

const router = express.Router();

router.post("/projects", requireAuth, createProjectController);
router.get("/projects/emails", requireAuth, getProjectEmails);
router.get("/user-projects", requireAuth, handleGetProjectsByUserId);
router.patch("/projects/filters", requireAuth, updateProjectFilters);
router.patch("/session-update", requireAuth, updateSession);
router.get("/session-project", getSessionProject);
router.delete("/projects",  requireAuth, deleteProjectById);

export default router;
