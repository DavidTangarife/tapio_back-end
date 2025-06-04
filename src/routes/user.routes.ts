import express from "express";
import { handleGoogleAuth, handleUpdateUserName } from "../controllers/user.controller";

const router = express.Router();

router.put("/update-name", handleUpdateUserName);
// router.post("/google-auth", handleGoogleOAuthCallback);
router.post("/auth/google", handleGoogleAuth);

export default router;