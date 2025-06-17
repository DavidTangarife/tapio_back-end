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
exports.saveEmailsFromIMAP = saveEmailsFromIMAP;
exports.getEmailsByProject = getEmailsByProject;
exports.getFilteredEmails = getFilteredEmails;
const email_model_1 = __importDefault(require("../models/email.model"));
const mongoose_1 = require("mongoose");
const project_model_1 = __importDefault(require("../models/project.model"));
/**
 * Saves an array of parsed email objects to the database in a single bulk insert.
 * Uses `insertMany` with `ordered: false` to allow partial success.
 * If some emails fail to insert, retries them one by one.
 * @parsedEmailArray: Array of email objects parsed from IMAP to save in DB.
 */
function saveEmailsFromIMAP(parsedEmailArray) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(parsedEmailArray);
        if (!Array.isArray(parsedEmailArray) || parsedEmailArray.length === 0) {
            console.warn("No emails to save.");
            return;
        }
        const emailsToInsert = parsedEmailArray.map(email => (Object.assign(Object.assign({}, email), { createdAt: new Date() })));
        try {
            yield email_model_1.default.insertMany(emailsToInsert);
            console.log(`Inserted ${emailsToInsert.length} emails`);
        }
        catch (err) {
            if (err.writeErrors) {
                console.warn(`${err.writeErrors.length} emails failed. Retrying individually...`);
                for (const writeError of err.writeErrors) {
                    const failedEmail = writeError.getOpertaion();
                    try {
                        yield email_model_1.default.create(failedEmail);
                        console.log("Retried and saved one failed email.");
                    }
                    catch (singleErr) {
                        console.error("Retry failed for one email:", singleErr);
                    }
                }
            }
            else {
                console.error("Unexpected insert error:", err);
            }
        }
    });
}
function getEmailsByProject(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield email_model_1.default.findByProjectId(new mongoose_1.Types.ObjectId(projectId));
    });
}
// Escape any special characters in a string to safely use in a regular expression
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Builds a filter object for regex inclusion/exclusion. This is a helper function to query emails
 * @param include Array of strings to include
 * @param exclude Array of strings to exclude
 */
function buildRegexFilter(include, exclude) {
    const filter = {};
    if (include === null || include === void 0 ? void 0 : include.length) {
        filter.$regex = include.map(escapeRegex).join("|");
        filter.$options = "i";
    }
    if (exclude === null || exclude === void 0 ? void 0 : exclude.length) {
        filter.$not = new RegExp(exclude.map(escapeRegex).join("|"), "i");
    }
    return Object.keys(filter).length ? filter : null;
}
/**
 * Fetches emails for a test project with optional filters applied in DB.
 * Filters include matching subject keywords and sender email patterns.
 * Currently hardcoded for testing with a specific project ID.
 */
function getFilteredEmails(project_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectId = new mongoose_1.Types.ObjectId(project_id);
        const project = yield project_model_1.default.findById(projectId);
        if (!project)
            throw new Error("Project not found");
        const { filters, blockedFilters, startDate } = project;
        // Find the latest email already saved for this project
        const latestEmail = yield email_model_1.default.findOne({ projectId }).sort({ mailBoxId: -1 });
        // const dateThreshold = latestEmail && latestEmail.date
        //   ? latestEmail.date
        //   : startDate;
        // Create a base query object to match emails for this project
        const query = {
            projectId,
            // date: { $gt: dateThreshold },
            $and: []
        };
        const subjectFilter = buildRegexFilter(filters === null || filters === void 0 ? void 0 : filters.keywords, blockedFilters === null || blockedFilters === void 0 ? void 0 : blockedFilters.keywords);
        if (subjectFilter)
            query.$and.push({ subject: subjectFilter });
        // Build sender filter (includes + excludes)
        const fromFilter = buildRegexFilter(filters === null || filters === void 0 ? void 0 : filters.senders, blockedFilters === null || blockedFilters === void 0 ? void 0 : blockedFilters.senders);
        if (fromFilter)
            query.$and.push({ from: fromFilter });
        // If no $and filters were added, remove the property
        if (!query.$and.length)
            delete query.$and;
        return yield email_model_1.default.find(query).sort({ mailBoxId: -1 });
    });
}
// {
//   projectId: new ObjectId("682efb5211da37c9c95e0779"),
//   date: { $gte: 2024-05-15T00:00:00.000Z },
//   subject: {
//     $regex: "mentoring|vision",
//     $options: "i"
//   },
//   from: {
//     $regex: "info@mentorloop\\.com|careers@example\\.com",
//     $options: "i"
//   }
// }
