"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/test", (req, res) => {
    console.log("Session in here:", req.session);
    res.json({
        message: "Welcome to test auth",
        userId: req.session.user_id,
        sessionData: req.session
    });
});
exports.default = router;
