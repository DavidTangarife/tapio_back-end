import express from "express";
import { fetchEmailsController, getEmailsForFiltering, getInboxEmails,  } from "../controllers/email.controller";
import requireAuth from "../middleware/require-auth";
// import { getEmailByProjectId } from "../controllers/email.controller";

const router = express.Router();

// router.get("/getemails", getEmailByProjectId);
// router.get("/getemails", fetchFilteredEmails);
router.post("/fetch-emails", requireAuth, fetchEmailsController);
// router.get("/projects/:projectId/emails", requireAuth, fetchFilteredEmails)
router.get("/projects/:projectId/inbox", requireAuth, getInboxEmails)
router.get("/projects/:projectId/filter-emails", requireAuth, getEmailsForFiltering )

export default router;