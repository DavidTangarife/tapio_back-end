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
const mongoose_1 = require("mongoose");
const emailSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    // opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity" },
    mailBoxId: { type: String },
    subject: { type: String },
    snippet: { type: String, required: true },
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    bcc: [{ type: String }],
    date: { type: Date },
    isRead: { type: Boolean, default: false },
    isTapped: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    isOutgoing: { type: Boolean, default: false },
    threadId: { type: String },
    body: { type: String },
    raw: { type: String },
}, {
    timestamps: true
});
// Instance method
emailSchema.methods.updateStatus = function (updates) {
    return __awaiter(this, void 0, void 0, function* () {
        Object.assign(this, updates);
        yield this.save();
    });
};
// Static method
emailSchema.statics.findByProjectId = function (projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({ projectId });
    });
};
emailSchema.post("save", function (doc) {
    console.log(`Email saved: ${doc._id}`);
});
exports.default = (0, mongoose_1.model)("Email", emailSchema);
