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
exports.getMicrosoftEmailsByDate = exports.handleMicrosoftRedirect = exports.loginWithMicrosoft = void 0;
const url_1 = require("url");
const state_1 = require("../services/state");
const user_services_1 = require("../services/user.services");
const microsoft_1 = require("../services/microsoft");
const project_services_1 = require("../services/project.services");
const email_services_1 = require("../services/email.services");
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
    const userData = { email: '', token_cache: '', token: '' };
    try {
        yield user_client.acquireTokenByCode((0, microsoft_1.getTokenRequest)(req, query)).then((token) => {
            userData.email = token.account.username;
            userData.token_cache = user_client.getTokenCache().serialize();
            userData.token = token.accessToken;
        });
    }
    catch (error) {
        next(error);
    }
    const user = yield (0, user_services_1.findOrCreateUserFromMicrosoft)(userData);
    req.session.user_id = user[0]._id;
    req.session.save();
    res.redirect("http://localhost:5173/setup");
});
exports.handleMicrosoftRedirect = handleMicrosoftRedirect;
const getMicrosoftEmailsByDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.session.user_id;
    const project_id = req.session.project_id;
    if (!user) {
        res.redirect('/microsoft-login');
    }
    if (!project_id) {
        res.redirect("http://localhost:5173/setup");
    }
    const user_account = yield (0, user_services_1.getUserById)(user);
    const user_data = yield (0, microsoft_1.silentlyRefreshToken)(user_account.token_cache || '');
    const project = yield (0, project_services_1.getProjectById)(project_id);
    //const emails: AxiosResponse = await getEmailsFromDate(user_data, new Date(query.date!.toString()))
    const predate = project.startDate;
    const date = new Date(predate - (Math.abs(project.startDate.getTimezoneOffset() * 60000) * 2));
    const emails = yield (0, microsoft_1.getEmailsFromDate)(user_data, date);
    if (emails.status == 200) {
        const email_objects = emails.data.value.map((x) => {
            return { mailBoxid: x.id, subject: x.subject, snippet: x.bodyPreview, date: x.createdDateTime, from: x.from.emailAddress.address, projectId: project._id };
        });
        (0, email_services_1.saveEmailsFromIMAP)(email_objects);
    }
    else {
        res.send('Sorry, Something went wrong');
    }
});
exports.getMicrosoftEmailsByDate = getMicrosoftEmailsByDate;
