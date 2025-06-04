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
exports.handleUpdateUserName = void 0;
const user_services_1 = require("../services/user.services");
const bson_1 = require("bson");
const handleUpdateUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, fullName } = req.body;
    // console.log("Request body:", req.body);
    if (!fullName) {
        return res.status(400).json({ error: "Full name is required." });
    }
    try {
        const updateUser = yield (0, user_services_1.updateUserFullName)(new bson_1.ObjectId(String(userId)), fullName);
        // console.log("Request body:", req.body);
        res.status(200).json(updateUser);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.handleUpdateUserName = handleUpdateUserName;
