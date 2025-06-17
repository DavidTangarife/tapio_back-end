"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requireAuth = (req, res, next) => {
    console.log("checking your session");
    if (!req.session.user_id) {
        res.status(401).json({ error: "Unauthorized access: Please login" });
        return;
    }
    next();
};
exports.default = requireAuth;
