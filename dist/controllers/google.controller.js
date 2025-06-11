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
exports.handleGoogleRedirect = exports.loginWithGoogle = void 0;
const google_1 = require("../services/google");
const url_1 = require("url");
const state_1 = require("../services/state");
const user_services_1 = require("../services/user.services");
const mongoose_1 = require("mongoose");
const google_client = (0, google_1.get_google_auth_client)('http://localhost:3000/api/google-redirect');
const loginWithGoogle = (req, res, next) => {
    const url = (0, google_1.get_google_auth_url_email)(google_client, (0, state_1.setState)(req));
    console.log(url);
    res.redirect(url);
};
exports.loginWithGoogle = loginWithGoogle;
const handleGoogleRedirect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, url_1.parse)(req.url || "", true).query;
    if (query.error)
        next(query.error);
    (0, state_1.checkState)(req, String(query.state));
    const result = yield (0, google_1.processGoogleCode)(String(query.code), google_client);
    const userData = { email: result.email, refresh_token: result.refresh_token };
    const user = yield (0, user_services_1.findOrCreateUserFromGoogle)(userData);
    req.session.user_id = user[0]._id;
    req.session.save();
    const emails = yield (0, google_1.getGmailApi)(userData.refresh_token, result.access_token, new mongoose_1.Types.ObjectId(1));
    res.send('User Logged in ' + user[0].email + ' and this user is ' + user[1] + '\n\n' + JSON.stringify(emails));
});
exports.handleGoogleRedirect = handleGoogleRedirect;
