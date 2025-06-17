"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const require_auth_1 = __importDefault(require("../middleware/require-auth"));
const router = express_1.default.Router();
router.put("/update-name", user_controller_1.handleUpdateUserName);
router.get("/full-name", user_controller_1.handleGetUserName);
router.patch("/update-name", require_auth_1.default, user_controller_1.handleUpdateUserName);
router.post("/auth/google", user_controller_1.handleGoogleAuth);
exports.default = router;
