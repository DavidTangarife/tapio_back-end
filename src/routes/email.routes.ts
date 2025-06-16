import express from "express";
import { directEmails, fetchEmailsController, fetchFilteredEmails } from "../controllers/email.controller";
import requireAuth from "../middleware/require-auth";
// import { getEmailByProjectId } from "../controllers/email.controller";

const router = express.Router();

// router.get("/getemails", getEmailByProjectId);
router.get("/getemails", fetchFilteredEmails);
router.post("/fetch-emails", requireAuth, fetchEmailsController);
router.get("/projects/:projectId/emails", requireAuth, fetchFilteredEmails)
router.post("/direct-emails", requireAuth, directEmails)

export default router;
