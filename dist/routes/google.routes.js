"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const google_controller_1 = require("../controllers/google.controller");
const googleRouter = express_1.default.Router();
googleRouter.get("/google-login", google_controller_1.loginWithGoogle);
googleRouter.get("/google-redirect", google_controller_1.handleGoogleRedirect);
exports.default = googleRouter;
