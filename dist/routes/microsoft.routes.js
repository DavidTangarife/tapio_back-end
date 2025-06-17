"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const microsoft_controller_1 = require("../controllers/microsoft.controller");
const microsoftRouter = (0, express_1.Router)();
microsoftRouter.get("/microsoft-login", microsoft_controller_1.loginWithMicrosoft);
microsoftRouter.get("/microsoft-redirect", microsoft_controller_1.handleMicrosoftRedirect);
microsoftRouter.get("/microsoft-emails", microsoft_controller_1.getMicrosoftEmailsByDate);
exports.default = microsoftRouter;
