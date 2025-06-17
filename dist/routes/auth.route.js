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
const require_auth_1 = __importDefault(require("../middleware/require-auth"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Test to protect the API endpoint. Just put it in the route definition like this
// It will execute before the request reaches the function that proceses a request
// response here is just to test.
router.get("/test", require_auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        message: "Welcome to test auth",
        userId: req.session.user_id,
        sessionData: req.session
    });
}));
//Logout to end a user's session
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session termination error", err);
            return res.status(500).json({ error: err.message });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully " });
        res.redirect('/');
    });
});
exports.default = router;
