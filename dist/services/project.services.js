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
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.updateLastLogin = updateLastLogin;
const project_model_1 = __importDefault(require("../models/project.model"));
const mongoose_1 = require("mongoose");
const status_model_1 = __importDefault(require("../models/status.model"));
/* Create and return a new project */
function createProject(data) {
    return __awaiter(this, void 0, void 0, function* () {
        //  console.log("Inside createProject service, data:", data);
        const defaultStatuses = [
            { title: "To review", order: 1 },
            { title: "Applied", order: 2 },
            { title: "Interviewing", order: 3 },
            { title: "offer", order: 4 },
        ];
        try {
            const project = yield project_model_1.default.create(data);
            console.log("Project created successfully:", project);
            // create default status for the project in database
            yield Promise.all(defaultStatuses.map((status) => status_model_1.default.create(Object.assign(Object.assign({}, status), { projectId: project._id }))));
            console.log("Default statuses created for project:", project._id);
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
/* Get project from id */
function getProjectById(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield project_model_1.default.findOne({ _id });
    });
}
;
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
        if (updates.blockedFilters !== undefined)
            project.blockedFilters = updates.blockedFilters;
        return yield project.save();
    });
}
/**
 * Updates the lastLogin field of a project by ID.
 * @param projectId The ID of the project to update.
 * @returns The updated project document.
 */
function updateLastLogin(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield project_model_1.default.findByIdAndUpdate(projectId, { lastLogin: new Date() }, { new: true });
        return project;
    });
}
