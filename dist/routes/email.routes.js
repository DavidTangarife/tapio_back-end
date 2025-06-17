"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const email_controller_1 = require("../controllers/email.controller");
const require_auth_1 = __importDefault(require("../middleware/require-auth"));
// import { getEmailByProjectId } from "../controllers/email.controller";
const router = express_1.default.Router();
// router.get("/getemails", getEmailByProjectId);
router.get("/getemails", email_controller_1.fetchFilteredEmails);
router.post("/fetch-emails", require_auth_1.default, email_controller_1.fetchEmailsController);
router.get("/projects/:projectId/emails", require_auth_1.default, email_controller_1.fetchFilteredEmails);
router.post("/direct-emails", require_auth_1.default, email_controller_1.directEmails);
exports.default = router;
