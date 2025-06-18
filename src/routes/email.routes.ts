import express from "express";
import { 
    fetchEmailsController,
    getEmailBody,
    getEmailData,
    getEmailsForFiltering,
    getInboxEmails,
    updateIsRead,
    updateTapIn,
} from "../controllers/email.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/fetch-emails", requireAuth, fetchEmailsController);
router.get("/projects/:projectId/inbox", requireAuth, getInboxEmails);
router.get("/projects/:projectId/filter-emails", requireAuth, getEmailsForFiltering);
router.patch("/emails/:emailId/tap", requireAuth, updateTapIn);
router.patch("/emails/:emailId/read", requireAuth, updateIsRead);
router.get('/emails/:emailId/body', requireAuth, getEmailBody);
router.get("/emails/:emailId", requireAuth, getEmailData)


export default router;