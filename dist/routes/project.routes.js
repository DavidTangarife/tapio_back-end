"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const require_auth_1 = __importDefault(require("../middleware/require-auth"));
const router = express_1.default.Router();
router.post("/projects", require_auth_1.default, project_controller_1.createProjectController);
router.patch("/projects/:projectId/last-login", project_controller_1.updateLastLoginController);
exports.default = router;
