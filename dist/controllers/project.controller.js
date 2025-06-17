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
exports.updateLastLoginController = exports.createProjectController = void 0;
const project_services_1 = require("../services/project.services");
const createProjectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, startDate, filters } = req.body;
    const userId = req.session.user_id;
    // console.log(userId)
    // console.log("Request body:", req.body);
    try {
        const project = yield (0, project_services_1.createProject)({
            userId,
            name,
            startDate: new Date(startDate),
            filters
        });
        // console.log("Request body:", req.body);
        req.session.project_id = project._id;
        req.session.save();
        res.status(201).json(project);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createProjectController = createProjectController;
/**
 * Controller to handle updating a project's lastLogin timestamp.
 */
const updateLastLoginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.projectId;
        const project = yield (0, project_services_1.updateLastLogin)(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ message: "lastLogin updated", project });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});
exports.updateLastLoginController = updateLastLoginController;
