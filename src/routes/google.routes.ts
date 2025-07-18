import { Router } from "express";
import { getGoogleEmailsByDate, handleGoogleRedirect, loginWithGoogle, sendEmail } from "../controllers/google.controller";
import requireAuth from "../middleware/require-auth";

const googleRouter = Router();

googleRouter.get("/google-login", loginWithGoogle)
googleRouter.get("/google-redirect", handleGoogleRedirect)
googleRouter.post("/google-emails", getGoogleEmailsByDate)
googleRouter.post("/send-email", requireAuth, sendEmail)

export default googleRouter
