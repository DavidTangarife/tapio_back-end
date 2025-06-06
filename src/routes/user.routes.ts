import express from "express";
import { handleGoogleAuth, handleUpdateUserName } from "../controllers/user.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.patch("/update-name", requireAuth, handleUpdateUserName);
router.post("/auth/google", handleGoogleAuth);

export default router;