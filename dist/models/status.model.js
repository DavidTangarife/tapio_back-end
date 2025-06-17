"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const statusSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number },
    color: { type: String, default: "gray" },
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)("Status", statusSchema);
