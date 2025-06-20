import express from "express";
import {
  createOpportunityController,
  getOpportunitiesByProjectController,
  updateOpportunityStateController,
} from "../controllers/opportunity.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post("/opportunity", requireAuth, createOpportunityController);
router.get("/opportunity", requireAuth, getOpportunitiesByProjectController);
router.patch("/opportunity/:opportunityId", updateOpportunityStateController);

export default router;
