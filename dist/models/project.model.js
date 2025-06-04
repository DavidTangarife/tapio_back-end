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
const user_model_1 = __importDefault(require("./user.model"));
const projectSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    filters: {
        keywords: [{ type: String }],
        senders: [{ type: String }]
    },
}, {
    timestamps: true
});
// Instance method
// projectSchema.methods.updateFilters = function(newFilters: { keywords: string[]; senders: string[] }) {
//   this.filters = newFilters;
//   return this.save()
// }
// static method
projectSchema.statics.findByUserId = function (userId) {
    return this.findOne({ userId });
};
/* Validation before storing in database */
/* unique project name for the user */
projectSchema.pre("validate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield this.model("Project").findOne({
            userId: this.userId,
            name: this.name,
            _id: { $ne: this._id } // ignore self on update
        });
        if (existing) {
            return next(new Error("Project name must be unique for the user."));
        }
        next();
    });
});
/* validate startDate not in future or past more than month ago */
projectSchema.pre("validate", function (next) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateLimit = new Date();
    dateLimit.setDate(today.getDate() - 30);
    dateLimit.setHours(0, 0, 0, 0);
    if (this.startDate) {
        const start = new Date(this.startDate);
        start.setHours(0, 0, 0, 0);
        if (start > today) {
            return next(new Error("Start date cannot be in the future."));
        }
        if (start < dateLimit) {
            return next(new Error("Start date cannot be more than 30 days ago."));
        }
    }
    next();
});
/* validate userId exists */
projectSchema.pre("validate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_model_1.default.findById(this.userId);
        if (!user) {
            return next(new Error("User does not exist."));
        }
        next();
    });
});
/* validate length of project name has to between 3 and 100 characters */
projectSchema.pre("validate", function (next) {
    if (this.name && (this.name.length < 3 || this.name.length > 100)) {
        return next(new Error("Project name must be between 3 and 100 characters."));
    }
    next();
});
/* Show a message before saving */
projectSchema.pre("save", function (next) {
    if (this.isNew) {
        console.log("Creating new project...");
    }
    next();
});
/* Show a message after saving */
projectSchema.post("save", function (doc) {
    console.log(`Project saved: ${doc._id}`);
});
exports.default = (0, mongoose_1.model)("Project", projectSchema);
