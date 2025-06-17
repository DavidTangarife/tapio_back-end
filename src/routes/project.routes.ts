import express from "express";
import { 
    createProjectController, 
    updateLastLoginController, 
    updateProjectFilters
} from "../controllers/project.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/projects", requireAuth, createProjectController);
router.patch("/projects/:projectId/last-login", updateLastLoginController);
router.patch("/projects/:projectId/filters", updateProjectFilters);


export default router;