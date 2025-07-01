import express from "express";
import {
  createStatusController,
  getKanbanController,
  handleGetStatusesByProject,
  updateStatusColumnName,
} from "../controllers/status.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/status", requireAuth, createStatusController);
router.get("/board", requireAuth, getKanbanController);
router.get("/status", requireAuth, handleGetStatusesByProject);
router.patch("/update-column", requireAuth, updateStatusColumnName);


export default router;
