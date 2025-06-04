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
exports.createProject = createProject;
exports.getProjectByUserId = getProjectByUserId;
exports.updateProject = updateProject;
const project_model_1 = __importDefault(require("../models/project.model"));
const mongoose_1 = require("mongoose");
/* Create and return a new project */
function createProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Inside createProject service, data:", data);
        try {
            const project = yield project_model_1.default.create(data);
            console.log("Project created successfully:", project);
            return project;
        }
        catch (error) {
            console.error("Error in createProject:", error);
            throw error;
        }
    });
}
/* Get projects belongs to a user by user's id */
function getProjectByUserId(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield project_model_1.default.findByUserId(new mongoose_1.Types.ObjectId(userId));
    });
}
// export async function updateProjectFilters(projectId: string, filters: { keywords: string[]; senders: string[] }) {
//   const project = await Project.findById(projectId);
//   if (!projectId) throw new Error("Project not found");
//   return await project?.updateFilters(filters);
// }
/* Update all or some fields of a project */
function updateProject(projectId, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield project_model_1.default.findById(projectId);
        if (!project)
            throw new Error("Project not found");
        if (updates.name !== undefined)
            project.name = updates.name;
        if (updates.startDate !== undefined)
            project.startDate = updates.startDate;
        if (updates.filters !== undefined)
            project.filters = updates.filters;
        return yield project.save();
    });
}
