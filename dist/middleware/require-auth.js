"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    if (!req.sessionID) {
        res.status(401).json({ error: "Unauthorized access: Please login" });
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
