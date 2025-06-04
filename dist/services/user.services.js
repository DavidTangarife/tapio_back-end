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
exports.findOrCreateUserFromGoogle = findOrCreateUserFromGoogle;
exports.updateUserFullName = updateUserFullName;
exports.getUserByEmail = getUserByEmail;
const user_model_1 = __importDefault(require("../models/user.model"));
/* Create user or return existing one */
function findOrCreateUserFromGoogle(googleUserData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, refresh_token } = googleUserData;
        let user = yield user_model_1.default.findOne({ email });
        if (!user) {
            user = yield user_model_1.default.create({ email, refresh_token });
            return [user, 'new'];
        }
        else {
            // update refresh token if changed
            if (user.refresh_token !== refresh_token) {
                user.refresh_token = refresh_token;
                yield user.save();
            }
        }
        return [user, 'existing'];
    });
}
;
/* Update full name after user has authenticated */
function updateUserFullName(userId, fullName) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.fullName = fullName.trim();
        yield user.save();
        return user;
    });
}
/* Return a user using email */
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield user_model_1.default.findOne({ email });
    });
}
;
