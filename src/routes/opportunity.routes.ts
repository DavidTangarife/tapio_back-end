import express from "express";
import {
  createOpportunityController,
  getOpportunitiesByProjectController,
  updateOpportunityStateController,
} from "../controllers/opportunity.controller";

const router = express.Router();

router.post("/opportunity", createOpportunityController);
router.get("/opportunity", getOpportunitiesByProjectController);
router.patch("/opportunity/:opportunityId", updateOpportunityStateController);

export default router;
