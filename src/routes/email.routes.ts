import express from "express";
import {
  directEmails,
  fetchEmailsController,
  getEmailBody,
  getEmailData,
  getEmailsForFiltering,
  getInboxEmails,
  updateIsRead,
  updateTapIn,
  processAndApprove,
<<<<<<< HEAD
  getAllowedEmails,
  getBlockedEmails
=======
  emailAssignOpportunity,
>>>>>>> main
} from "../controllers/email.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.get("/getemails", requireAuth, getInboxEmails);
router.post("/direct-emails", requireAuth, directEmails);
router.post("/fetch-emails", requireAuth, fetchEmailsController);
router.get("/unprocessed-emails", requireAuth, getEmailsForFiltering);
router.get("/allowed-emails", requireAuth, getAllowedEmails);
router.get("/blocked-emails", requireAuth, getBlockedEmails);

router.patch("/emails/:emailId/tap", requireAuth, updateTapIn);
router.patch("/emails/:emailId/read", requireAuth, updateIsRead);
router.get("/emails/:emailId/body", requireAuth, getEmailBody);
router.get("/emails/:emailId", requireAuth, getEmailData);
router.patch("/emails/:emailId/process", requireAuth, processAndApprove);
router.patch("/emails/:emailId/oppo", requireAuth, emailAssignOpportunity);

export default router;
