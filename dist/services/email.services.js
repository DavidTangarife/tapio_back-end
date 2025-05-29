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
exports.getEmailsByProject = getEmailsByProject;
exports.insertEmailsInBatches = insertEmailsInBatches;
exports.saveEmailsFromIMAP = saveEmailsFromIMAP;
const email_model_1 = __importDefault(require("../models/email.model"));
const mongoose_1 = require("mongoose");
function getEmailsByProject(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield email_model_1.default.findByProjectId(new mongoose_1.Types.ObjectId(projectId));
    });
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function insertEmailsInBatches(emails_1) {
    return __awaiter(this, arguments, void 0, function* (emails, batchSize = 99, delayMs = 1000) {
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize).map(email => (Object.assign(Object.assign({}, email), { 
                //   to: email.to?.length ? email.to : [userEmail], 
                createdAt: new Date() })));
            try {
                yield email_model_1.default.insertMany(batch, { ordered: false });
                console.log(`Inserted batch ${i / batchSize + 1}`);
            }
            catch (err) {
                console.error("Error inserting batch:", err);
            }
            yield delay(delayMs); // throttle to stay under MongoDB Atlas limit
        }
    });
}
// 
function saveEmailsFromIMAP(parsedEmailArray) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(parsedEmailArray) || parsedEmailArray.length === 0) {
            console.warn("No emails to save.");
            return;
        }
        yield insertEmailsInBatches(parsedEmailArray);
    });
}
/* Reply an email */
// export async function replyToEmail(emailId: string, replyBody: string) {
//   const email = await Email.findById(emailId);
//   if (!email) throw new Error("Email not found");
//   // Logic to send the reply...
//   email.isReplied = true;
//   await email.save();
//   return email;
// }
