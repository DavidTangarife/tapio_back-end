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
exports.handleMicrosoftRedirect = exports.loginWithMicrosoft = void 0;
const url_1 = require("url");
const state_1 = require("../services/state");
const user_services_1 = require("../services/user.services");
const microsoft_1 = require("../services/microsoft");
const axios_1 = __importDefault(require("axios"));
const microsoft_client = microsoft_1.confidentialClient;
;
const loginWithMicrosoft = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, microsoft_1.buildPkceCodes)(req);
    (0, state_1.setState)(req);
    microsoft_client.getAuthCodeUrl((0, microsoft_1.getAuthCodeParams)(req)).then((url) => {
        res.redirect(url);
    });
});
exports.loginWithMicrosoft = loginWithMicrosoft;
const handleMicrosoftRedirect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, url_1.parse)(req.url || "", true).query;
    const user_client = (0, microsoft_1.getNewMicrosoftClient)();
    if (query.error)
        next(query.error);
    (0, state_1.checkState)(req, String(query.state));
    let userData = { email: '', token_cache: '', token: '' };
    try {
        yield user_client.acquireTokenByCode((0, microsoft_1.getTokenRequest)(req, query)).then((token) => {
            userData = { email: token.account.username, token_cache: user_client.getTokenCache().serialize(), token: token.accessToken };
        });
    }
    catch (error) {
        next(error);
    }
    const user = yield (0, user_services_1.findOrCreateUserFromMicrosoft)(userData);
    const date = new Date();
    date.setDate(date.getDate() - 3);
    console.log(date.toISOString());
    const result = yield axios_1.default.get(`https://graph.microsoft.com/v1.0/me/messages?$filter=ReceivedDateTime ge 2025-06-09`, { headers: { 'Authorization': `Bearer ${userData.token}` } });
    res.send(result.data);
    /*req.session.user_id = user[0]._id
    res.send('User Logged in ' + user[0]!.email + ' and this user is ' + user[1])*/
});
exports.handleMicrosoftRedirect = handleMicrosoftRedirect;
