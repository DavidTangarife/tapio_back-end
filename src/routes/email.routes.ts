import express from "express";
import {
  directEmails,
  getEmailBody,
  getEmailData,
  getEmailsForFiltering,
  getInboxEmails,
  updateIsRead,
  updateTapIn,
  processAndApprove,
  getAllowedEmails,
  getBlockedEmails,
  emailAssignOpportunity,
  emailsFromOpportunity,
  fetchSearchedEmails,
} from "../controllers/email.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.get("/getemails", requireAuth, getInboxEmails);
router.post("/direct-emails", requireAuth, directEmails);
router.get("/unprocessed-emails", requireAuth, getEmailsForFiltering);
router.get("/allowed-emails", requireAuth, getAllowedEmails);
router.get("/blocked-emails", requireAuth, getBlockedEmails);
router.patch("/emails/:emailId/tap", requireAuth, updateTapIn);
router.patch("/emails/:emailId/read", requireAuth, updateIsRead);
router.get("/emails/:emailId/body", requireAuth, getEmailBody);
router.get("/emails/:emailId", requireAuth, getEmailData);
router.patch("/emails/:emailId/process", requireAuth, processAndApprove);
router.patch("/emails/:emailId/oppo", requireAuth, emailAssignOpportunity);
router.get("/getemails/:oppoId", requireAuth, emailsFromOpportunity);
router.get("/search", requireAuth, fetchSearchedEmails);

export default router;
