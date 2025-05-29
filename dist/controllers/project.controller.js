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
exports.createProjectController = void 0;
const project_services_1 = require("../services/project.services");
const createProjectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, name, startDate, filters } = req.body;
    try {
        const project = yield (0, project_services_1.createProject)({ userId, name, startDate, filters });
        res.status(201).json(project);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.createProjectController = createProjectController;
