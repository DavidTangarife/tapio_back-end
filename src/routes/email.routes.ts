import express from "express";
import { fetchFilteredEmails } from "../controllers/email.controller";
// import { getEmailByProjectId } from "../controllers/email.controller";

const router = express.Router();

// router.get("/getemails", getEmailByProjectId);
router.get("/getemails", fetchFilteredEmails);


export default router;