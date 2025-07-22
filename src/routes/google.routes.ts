import { Router } from "express";
import { createCalendarEventController, getGoogleEmailsByDate, handleGoogleRedirect, loginWithGoogle, sendEmail } from "../controllers/google.controller";
import requireAuth from "../middleware/require-auth";

const googleRouter = Router();

googleRouter.get("/google-login", loginWithGoogle)
googleRouter.get("/google-redirect", handleGoogleRedirect)
googleRouter.post("/google-emails", getGoogleEmailsByDate)
googleRouter.post("/send-email", requireAuth, sendEmail)
googleRouter.post("/add-to-calendar", requireAuth, createCalendarEventController)

export default googleRouter
