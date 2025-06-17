"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetStatusesByProject = exports.getKanbanController = exports.createStatusController = void 0;
const status_services_1 = require("../services/status.services");
const mongoose_1 = require("mongoose");
const opportunity_services_1 = require("../services/opportunity.services");
const status_model_1 = __importDefault(require("../models/status.model"));
const createStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, title, color } = req.body;
    if (!projectId || !title || !color) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    try {
        const status = yield (0, status_services_1.createStatus)({
            projectId: new mongoose_1.Types.ObjectId(projectId),
            title: title.trim(),
            color,
        });
        res.status(201).json(status);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createStatusController = createStatusController;
/**
 * Controller to fetch Kanban board data for a project.
 * Retrieves all statuses (columns) and groups related opportunities (cards) under each status.
 * Expects a projectId query parameter.
 */
const getKanbanController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== "string") {
        return res
            .status(400)
            .json({ error: "Missing or invalid projectId in query params" });
    }
    const objectProjectId = new mongoose_1.Types.ObjectId(projectId);
    try {
        const statuses = yield (0, status_services_1.getStatusesByProject)(objectProjectId);
        const opportunities = yield (0, opportunity_services_1.getOpportunitiesByProject)(objectProjectId);
        // Group opportunities under their status
        const kanbanData = statuses.map((status) => {
            const statusOpportunities = opportunities.filter((opp) => opp.statusId.toString() ===
                status._id.toString());
            return Object.assign(Object.assign({}, status.toObject()), { opportunities: statusOpportunities });
        });
        res.status(200).json(kanbanData);
    }
    catch (err) {
        console.error("Error in getKanban:", err.message);
        res.status(500).json({ error: "Failed to load Kanban boards" });
    }
});
exports.getKanbanController = getKanbanController;
/**
 * Get the statuses for a project
 */
const handleGetStatusesByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const statuses = yield status_model_1.default.find({ projectId });
        return res.status(200).json(statuses);
    }
    catch (err) {
        console.error("Failed to fetch statuses", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.handleGetStatusesByProject = handleGetStatusesByProject;
