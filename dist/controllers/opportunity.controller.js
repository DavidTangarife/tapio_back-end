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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOpportunityStateController = exports.getOpportunitiesByProjectController = exports.createOpportunityController = void 0;
const opportunity_services_1 = require("../services/opportunity.services");
const bson_1 = require("bson");
const mongoose_1 = require("mongoose");
const createOpportunityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, statusId, title, company } = req.body;
    if (!projectId || !statusId || !title || !(company === null || company === void 0 ? void 0 : company.name)) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    try {
        const project = yield (0, opportunity_services_1.createOpportunity)({
            projectId: new bson_1.ObjectId(String(projectId)),
            statusId: new bson_1.ObjectId(String(statusId)),
            title,
            company,
        });
        res.status(201).json(project);
    }
    catch (err) {
        console.error("Error creating the opportunity:", err.message);
        res.status(500).json({ error: err.message });
    }
});
exports.createOpportunityController = createOpportunityController;
// THIS CAN BE DELETED IF THERE IS NO NEED BECAUSE WE GET ALL FROM THE KANBAN
const getOpportunitiesByProjectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.query;
    const objectProjectId = new mongoose_1.Types.ObjectId(projectId === null || projectId === void 0 ? void 0 : projectId.toString());
    try {
        const opportunities = yield (0, opportunity_services_1.getOpportunitiesByProject)(objectProjectId);
        res.status(200).json(opportunities);
    }
    catch (err) {
        console.error("Error fetching the opportunities:", err.message);
        res.status(500).json({ error: "Fail, Internal Server error" });
    }
});
exports.getOpportunitiesByProjectController = getOpportunitiesByProjectController;
// Update the opportunity state by id
const updateOpportunityStateController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { opportunityId } = req.params;
    const { statusId } = req.body;
    if (!opportunityId || !statusId) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    const opportunityObjectId = new mongoose_1.Types.ObjectId(opportunityId === null || opportunityId === void 0 ? void 0 : opportunityId.toString());
    const statusObjectId = new mongoose_1.Types.ObjectId(statusId === null || statusId === void 0 ? void 0 : statusId.toString());
    try {
        const updateOpportunity = yield (0, opportunity_services_1.updateOpportunityStatus)(opportunityObjectId, statusObjectId);
        res.status(200).json(updateOpportunity);
    }
    catch (err) {
        console.error("Error updating the the opportunity:", err.message);
        res.status(500).json({ error: "Fail, Internal Server error" });
    }
});
exports.updateOpportunityStateController = updateOpportunityStateController;
