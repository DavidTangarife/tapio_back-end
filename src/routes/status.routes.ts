import express from "express";
import {
  createStatusController,
  getKanbanController,
} from "../controllers/status.controller";

const router = express.Router();

router.post("/status", createStatusController);
router.get("/status", getKanbanController);

export default router;
