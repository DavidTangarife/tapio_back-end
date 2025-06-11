import express from "express";
import { fetchEmailsController, fetchFilteredEmails } from "../controllers/email.controller";
import requireAuth from "../middleware/require-auth";
// import { getEmailByProjectId } from "../controllers/email.controller";

const router = express.Router();

// router.get("/getemails", getEmailByProjectId);
router.get("/getemails", fetchFilteredEmails);
router.post("/fetch-emails", requireAuth, fetchEmailsController);
router.get("/projects/:projectId/emails", requireAuth, fetchFilteredEmails)

export default router;