import express from "express";
import {
  handleGetUserName,
  handleUpdateUserName,
  handleGoogleAuth,
  checkForUser,
  logoutUser,
} from "../controllers/user.controller";
import requireAuth from "../middleware/require-auth";
const router = express.Router();

router.put("/update-name", handleUpdateUserName);
router.get("/full-name", requireAuth, handleGetUserName);
router.get("/users/check", checkForUser);
router.post("/users/logout", logoutUser);
router.patch("/update-name", requireAuth, handleUpdateUserName);
router.post("/auth/google", handleGoogleAuth);

export default router;
