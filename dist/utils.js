"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = getErrorMessage;
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    if (typeof error === "string") {
        return error;
    }
    return "An unknown error has occurred";
}
