import express from "express";
import { createStatusController } from "../controllers/status.controller";
import { getKanbanBoardData } from "../controllers/status.controller";

const router = express.Router();

router.post("/status", createStatusController);
router.get("/kanban", getKanbanBoardData);

export default router;