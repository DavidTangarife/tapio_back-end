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
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const microsoft_routes_1 = __importDefault(require("./routes/microsoft.routes"));
const opportunity_routes_1 = __importDefault(require("./routes/opportunity.routes"));
const status_routes_1 = __importDefault(require("./routes/status.routes"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const mongoose_1 = __importDefault(require("mongoose"));
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const MongoStore = require('connect-mongo');
const mongoOptions = {
    mongoUrl: process.env.MONGO_URL
};
function createApp() {
    console.time('Create App Func');
    console.time('App');
    const app = (0, express_1.default)();
    mongoose_1.default.connect(process.env.MONGO_URL);
    console.timeEnd('App');
    console.time('Store');
    const store = new MongoDBStore({
        uri: process.env.MONGO_URL,
        collection: 'sessions'
    });
    console.timeEnd('Store');
    console.time('Mongoose Connect');
    console.timeEnd('Mongoose Connect');
    console.time('Cors');
    app.use((0, cors_1.default)({
        origin: "http://localhost:5173",
        credentials: true,
    }));
    console.timeEnd('Cors');
    console.time('Json');
    app.use(express_1.default.json());
    console.timeEnd('Json');
    //======================================================
    // The session middleware will be used to validate 
    // requests with a state variable.
    //
    // This variable is a 32 byte hex string and is 
    // sent to the oauth2 server.
    //======================================================
    console.time('Session');
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax" //For OAuth redirects
        }
    }));
    console.timeEnd('Session');
    //=======================
    //        ROUTES
    //=======================
    console.time('Routes');
    app.use("/api", project_routes_1.default);
    app.use("/api", google_routes_1.default);
    app.use("/api", microsoft_routes_1.default);
    app.use("/api", auth_route_1.default);
    app.use("/api", user_routes_1.default);
    app.use("/api", email_routes_1.default);
    app.use("/api", opportunity_routes_1.default);
    app.use("/api", status_routes_1.default);
    console.timeEnd('Routes');
    //===================================================
    // Error Handling Middleware
    //
    // WARN: Please place all other app.use() above this.
    // Error middleware needs to be last in the chain.
    //
    //===================================================
    console.time('Error Handler');
    app.use(error_handler_1.default);
    console.timeEnd('Error Handler');
    console.timeEnd('Create App Func');
    return app;
}
