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
exports.handleGetUserName = exports.handleUpdateUserName = void 0;
exports.handleGoogleAuth = handleGoogleAuth;
const user_services_1 = require("../services/user.services");
const handleUpdateUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName } = req.body;
    const userId = req.session.user_id;
    // console.log(userId);
    if (!fullName) {
        return res.status(400).json({ error: "Full name is required." });
    }
    try {
        const updateUser = yield (0, user_services_1.updateUserFullName)(userId, fullName);
        // console.log("Request body:", req.body);
        res.status(200).json(updateUser);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.handleUpdateUserName = handleUpdateUserName;
const handleGetUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.session.user_id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const fullName = yield (0, user_services_1.getUserName)(userId);
        if (!fullName) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({ fullName });
    }
    catch (error) {
        console.error("Error fetching user name:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.handleGetUserName = handleGetUserName;
function handleGoogleAuth(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, refresh_token } = req.body;
            if (!email || !refresh_token) {
                return res.status(400).json({ message: "Missing email or refreshToken" });
            }
            const user = yield (0, user_services_1.findOrCreateUserFromGoogle)({ email, refresh_token });
            res.status(200).json({ message: "User signed in via Google", user });
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    });
}
