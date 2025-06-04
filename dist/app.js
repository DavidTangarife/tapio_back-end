"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const google_routes_1 = __importDefault(require("./routes/google.routes"));
const session = require("express-session");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // The session middleware will be used to validate requests with a state variable.
    // This variable is a 32 byte hex string and is sent to the google oauth2 server.
    app.use(session({
        // TODO: Implement a real session secret.
        secret: "testsecret",
        resave: false,
        saveUninitialized: false,
    }));
    app.use("/api", project_routes_1.default);
    app.use("/api", google_routes_1.default);
    app.use(error_handler_1.default);
    return app;
}
