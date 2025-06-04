"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = setState;
exports.checkState = checkState;
const node_crypto_1 = require("node:crypto");
function setState(req) {
    const state = (0, node_crypto_1.randomBytes)(32).toString("hex");
    req.session.state = state;
    return state;
}
function checkState(req, query_state) {
    if (req.session.state !== query_state) {
        throw new Error("State Mismatch, Potential CSRF Attack");
    }
}
