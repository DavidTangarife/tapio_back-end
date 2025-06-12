import express from "express";
import {
  createStatusController,
  getKanbanController,
  handleGetStatusesByProject,
} from "../controllers/status.controller";

const router = express.Router();

router.post("/status", createStatusController);
router.get("/status", getKanbanController);
router.get("/status/:projectId", handleGetStatusesByProject);

export default router;
