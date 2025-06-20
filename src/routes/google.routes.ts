import { Router } from "express";
import { getGoogleEmailsByDate, handleGoogleRedirect, loginWithGoogle } from "../controllers/google.controller";

const googleRouter = Router();

googleRouter.get("/google-login", loginWithGoogle)
googleRouter.get("/google-redirect", handleGoogleRedirect)
googleRouter.post("/google-emails", getGoogleEmailsByDate)

export default googleRouter
