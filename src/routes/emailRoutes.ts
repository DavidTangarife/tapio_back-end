import { Router } from "express";
import { fetchEmails } from "../controllers/emailController";

const router = Router();

router.get("/emails", fetchEmails);

export default router;
