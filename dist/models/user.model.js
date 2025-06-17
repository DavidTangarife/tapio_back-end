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
const userSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        minlength: [3, 'Full name must be at least 3 characters long'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique']
    },
    refresh_token: {
        type: String,
    },
    token_cache: {
        type: String,
    }
}, {
    timestamps: true
});
// Instance method
userSchema.methods.updateFullName = function (newName) {
    return __awaiter(this, void 0, void 0, function* () {
        this.fullName = newName.trim();
        this.updatedAt = new Date();
        yield this.save();
    });
};
// Show a message before saving
userSchema.pre("save", function (next) {
    if (this.isNew) {
        console.log("Creating new user...");
    }
    next();
});
// Show a message after saving
userSchema.post("save", function (doc) {
    console.log(`User saved: ${doc._id}`);
});
exports.default = (0, mongoose_1.model)("User", userSchema);
