"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const utils_1 = require("../utils");
function errorHandler(error, req, res, next) {
    console.log('Hi! I\'m a handler');
    if (res.headersSent) {
        next(error);
        return;
    }
    res.status(404).json({
        error: {
            message: (0, utils_1.getErrorMessage)(error)
        }
    });
}
