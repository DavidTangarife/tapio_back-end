"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        minlength: [3, 'Full name must be at least 3 characters long'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    refreshToken: {
        type: String,
        required: [true, 'Refresh token is required']
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
});
exports.default = (0, mongoose_1.model)("User", userSchema);
