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
const mongoose_1 = require("mongoose");
const project_model_1 = __importDefault(require("./project.model"));
const opportunitySchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    statusId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Status", required: true },
    emailId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Email" },
    title: { type: String, required: true, trim: true },
    company: {
        name: { type: String, required: true, trim: true },
        faviconUrl: { type: String, default: "" }, // handled in backend
    },
    isRejected: { type: Boolean, default: false },
    jobAdUrl: {
        type: String,
        validate: {
            validator: (v) => /^https?:\/\/.+/.test(v),
            message: (props) => `${props.value} is not a valid URL`,
        },
    },
    snips: {
        type: [{ label: String, value: String }],
        default: [],
    },
}, {
    timestamps: true,
});
// Static method
opportunitySchema.statics.findOppByProjectId = function (projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({ projectId });
    });
};
opportunitySchema.statics.findOppByStatusId = function (statusId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({ statusId });
    });
};
// pre saving validation
opportunitySchema.pre("validate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield project_model_1.default.findById(this.projectId);
        if (!project) {
            return next(new Error("Project does not exist."));
        }
        next();
    });
});
/* Show a message before saving */
opportunitySchema.pre("save", function (next) {
    if (this.isNew) {
        console.log("Creating new opportunity...");
    }
    next();
});
/* Show a message after saving */
opportunitySchema.post("save", function (doc) {
    console.log(`Opportunity saved: ${doc._id}`);
});
exports.default = (0, mongoose_1.model)("Opportunity", opportunitySchema);
