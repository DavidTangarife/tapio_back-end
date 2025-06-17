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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const MONGO_URL = process.env.MONGO_URL;
// This use the value from the environment variable MONGO_URL, but if it’s undefined,
// use the default string 'mongodb://mongo:27017/mydb' instead.
// It ensure the App works in different environments, in this case is useful for
// local development as the env variable is just set on the dockerfile.
if (!MONGO_URL) {
    throw new Error("Environment variable MONGO_URL must be defined!");
}
// Initialize the app
console.time('Create App');
const app = (0, app_1.default)();
console.timeEnd('Create App');
const port = process.env.PORT || 3000;
app.get("/", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.send(`Welcome to Tapio, I'd love to help but I'm an API! Please call me correctly`);
    });
});
const MONGO_OPTIONS = { connectTimeoutMS: 3600000, minPoolSize: 10 };
mongoose_1.default.connect(MONGO_URL).then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
        console.log(`Tapio is ready to rock your socks off on http://localhost:${port}`);
        console.log("Hey, You, Yes you, its all gonna be ok! YOU GOT THIS!");
    });
});
