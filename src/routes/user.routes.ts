import express from "express";
import { handleUpdateUserName } from "../controllers/user.controller";

const router = express.Router();

router.put("/update-name", handleUpdateUserName);
// router.post("/google-auth", handleGoogleOAuthCallback);

export default router;