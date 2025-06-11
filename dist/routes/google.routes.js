"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_controller_1 = require("../controllers/google.controller");
const googleRouter = (0, express_1.Router)();
googleRouter.get("/google-login", google_controller_1.loginWithGoogle);
googleRouter.get("/google-redirect", google_controller_1.handleGoogleRedirect);
exports.default = googleRouter;
