"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const status_controller_1 = require("../controllers/status.controller");
const router = express_1.default.Router();
router.post("/status", status_controller_1.createStatusController);
router.get("/status", status_controller_1.getKanbanController);
router.get("/status/:projectId", status_controller_1.handleGetStatusesByProject);
exports.default = router;
