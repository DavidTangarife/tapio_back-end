import { Router } from "express";
import { handleGoogleRedirect, loginWithGoogle } from "../controllers/google.controller";

const googleRouter = Router();

googleRouter.get("/google-login", loginWithGoogle)
googleRouter.get("/google-redirect", handleGoogleRedirect)

export default googleRouter
