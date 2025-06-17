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
exports.createOpportunity = createOpportunity;
exports.getOpportunitiesByProject = getOpportunitiesByProject;
exports.getOpportunitiesByStatus = getOpportunitiesByStatus;
exports.updateOpportunityStatus = updateOpportunityStatus;
exports.deleteOpportunity = deleteOpportunity;
const opportunity_model_1 = __importDefault(require("../models/opportunity.model"));
/* Create and return a new project */
function createOpportunity(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const opportunity = yield opportunity_model_1.default.create(data);
            console.log("Opportunity created successfully:", opportunity);
            return opportunity;
        }
        catch (error) {
            console.error("Error in createOpportunity", error);
            throw error;
        }
    });
}
function getOpportunitiesByProject(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        return opportunity_model_1.default.findOppByProjectId(projectId);
    });
}
function getOpportunitiesByStatus(statusId) {
    return __awaiter(this, void 0, void 0, function* () {
        return opportunity_model_1.default.findOppByStatusId(statusId);
    });
}
/* Update status of an opportunity (move card between columns) */
function updateOpportunityStatus(opportunityId, newStatusId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const opportunity = yield opportunity_model_1.default.findById(opportunityId);
            if (!opportunity) {
                throw new Error("Opportunity not found");
            }
            opportunity.statusId = newStatusId;
            yield opportunity.save();
            return opportunity;
        }
        catch (err) {
            console.error("Error in updateOpportunityStatus:", err.message);
            throw new Error("Failed to update opportunity status.");
        }
    });
}
/* Delete opportunity */
function deleteOpportunity(opportunityId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield opportunity_model_1.default.deleteOne({ _id: opportunityId });
            if (result.deletedCount === 0) {
                throw new Error("Opportunity not found or already deleted.");
            }
            return true;
        }
        catch (err) {
            console.error("Error in deleteOpportunity:", err.message);
            throw new Error("Failed to delete opportunity.");
        }
    });
}
