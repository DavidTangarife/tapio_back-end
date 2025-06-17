"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const opportunity_controller_1 = require("../controllers/opportunity.controller");
const router = express_1.default.Router();
router.post("/opportunity", opportunity_controller_1.createOpportunityController);
router.get("/opportunity", opportunity_controller_1.getOpportunitiesByProjectController);
router.patch("/opportunity/:opportunityId", opportunity_controller_1.updateOpportunityStateController);
exports.default = router;
