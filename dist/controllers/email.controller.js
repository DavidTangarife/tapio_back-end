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
exports.directEmails = exports.fetchFilteredEmails = exports.fetchEmailsController = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const email_services_1 = require("../services/email.services");
const imap_1 = require("../services/imap");
const mongoose_1 = require("mongoose");
const xoauth2_1 = require("../services/xoauth2");
const user_services_1 = require("../services/user.services");
const google_controller_1 = require("./google.controller");
const microsoft_controller_1 = require("./microsoft.controller");
// import { getEmailsByProject } from "../services/email.services";
// export const saveEmail = async (req: Request, res: Response) => {
//   const { mailBoxId,
//       subject,
//       from
//       } = req.body;
//   try{
//     const newEmail = new Email({
//       projectId: "682efb5211da37c9c95e0779",
//       mailBoxId,
//       subject,
//       from
//     });
//     const savedEmail = await newEmail.save();
//     res.status(201).json(savedEmail);
//   } catch (error) {
//     console.error("Error saving email:", error);
//     res.status(500).json({ error: "Failed to save email" });
//   }
// };
// export const getEmailByProjectId = async (req: Request, res: Response) => {
//   try {
//     const emails: any = await getEmailsByProject("682efb5211da37c9c95e0779");
//     res.status(200).json(emails);
//   } catch (err) {
//     console.error("Failed to fetch emails:", err);
//     res.status(500).json({ message: "Server error while fetching emails" });
//   }
// }
const fetchEmailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('fetchEmailsController called');
    try {
        const { projectId } = req.body;
        console.log(new mongoose_1.Types.ObjectId(String(projectId)));
        const userId = req.session.user_id;
        console.log(userId);
        if (!userId || !projectId) {
            return res.status(400).json({ error: "Missing userId or projectId" });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.email || !user.refresh_token) {
            return res.status(401).json({ error: "Email account not connected" });
        }
        if (!projectId)
            return res.status(400).json({ error: "Missing projectId" });
        // Find the project to get createdAt date
        const project = yield project_model_1.default.findById(new mongoose_1.Types.ObjectId(String(projectId)));
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        console.log(project);
        const xoauth2gen = (0, xoauth2_1.get_xoauth2_generator)(user.email, user.refresh_token);
        const xoauth2Token = yield (0, xoauth2_1.get_xoauth2_token)(xoauth2gen);
        const imap = (0, imap_1.get_imap_connection)(user.email, xoauth2Token);
        console.log("imap connected");
        const dateStr = project.startDate.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
        });
        console.log(dateStr);
        const emails = (0, imap_1.sender_and_subject_since_date_callback)(imap, dateStr, projectId, (emails) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Fetched emails:', emails);
            yield (0, email_services_1.saveEmailsFromIMAP)(emails);
            res.status(201).json(emails);
        }));
        console.log(emails);
    }
    catch (error) {
        console.error("Error fetching emails:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.fetchEmailsController = fetchEmailsController;
const fetchFilteredEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const emails = yield (0, email_services_1.getFilteredEmails)(projectId);
        console.log(emails);
        res.status(200).json(emails);
    }
    catch (err) {
        console.error("Failed to get filtered emails:", err.message);
        res.status(500).json({ error: "Failed to get emails." });
    }
});
exports.fetchFilteredEmails = fetchFilteredEmails;
const directEmails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.session.user_id;
        const user = yield (0, user_services_1.getUserById)(user_id);
        if (!user) {
            res.redirect("http://localhost:5173/");
        }
        if (user.refresh_token) {
            (0, google_controller_1.getGoogleEmailsByDate)(req, res, next);
        }
        else if (user.token_cache) {
            (0, microsoft_controller_1.getMicrosoftEmailsByDate)(req, res, next);
        }
    }
    catch (err) {
        next(err);
    }
});
exports.directEmails = directEmails;
