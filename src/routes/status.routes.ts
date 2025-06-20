import express from "express";
import {
  createStatusController,
  getKanbanController,
  handleGetStatusesByProject,
} from "../controllers/status.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/status", requireAuth, createStatusController);
router.get("/board", requireAuth, getKanbanController);
router.get("/status", requireAuth, handleGetStatusesByProject);

export default router;
