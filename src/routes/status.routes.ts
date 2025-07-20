import express from "express";
import {
  createStatusController,
  deleteStatus,
  getKanbanController,
  handleGetStatusesByProject,
  newStatusColumn,
  updateColumnOrder,
  updateStatusColumnName,
} from "../controllers/status.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/status", requireAuth, createStatusController);
router.get("/board", requireAuth, getKanbanController);
router.get("/status", requireAuth, handleGetStatusesByProject);
router.patch("/update-column", requireAuth, updateStatusColumnName);
router.post("/create-column", requireAuth, newStatusColumn);
router.patch("/update-column-order", requireAuth, updateColumnOrder);
router.delete("/status", requireAuth, deleteStatus);

export default router;
