import express from "express";
import { handleGetUserName, handleUpdateUserName } from "../controllers/user.controller";

const router = express.Router();

router.put("/update-name", handleUpdateUserName);
router.get("/get-fullname", handleGetUserName);
// router.post("/google-auth", handleGoogleOAuthCallback);

export default router;