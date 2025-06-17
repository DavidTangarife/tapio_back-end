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
exports.createStatus = createStatus;
exports.getStatusesByProject = getStatusesByProject;
exports.updateStatus = updateStatus;
const status_model_1 = __importDefault(require("../models/status.model"));
/* Create and return a new project */
function createStatus(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const status = yield status_model_1.default.create(data);
            console.log("status created successfully:", status);
            return status;
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error("This status title already exists.");
            }
            console.error("Error in createStatus", error);
            throw error;
        }
    });
}
function getStatusesByProject(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        return status_model_1.default.find({ projectId }).exec();
    });
}
/* Update a status (rename or change color) */
function updateStatus(statusId, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const status = yield status_model_1.default.findById(statusId);
            if (!status) {
                throw new Error("Status not found");
            }
            if (updates.title)
                status.title = updates.title.trim();
            if (updates.color)
                status.color = updates.color;
            yield status.save();
            return status;
        }
        catch (err) {
            console.error("Error in updateStatus:", err.message);
            throw new Error("Failed to update status.");
        }
    });
}
