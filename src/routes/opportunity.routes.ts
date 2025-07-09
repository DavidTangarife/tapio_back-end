import express from "express";
import {
  createOpportunityController,
  getOpportunitiesByProjectController,
  updateOpportunityStateController,
  UpdateOpportunityById,
  deleteOpportunityById,
  updateOpportunityOrder,
} from "../controllers/opportunity.controller";
import requireAuth from "../middleware/require-auth";

const router = express.Router();

router.post(
  "/opportunity/from-email",
  requireAuth,
  createOpportunityController
);
router.get("/opportunity", requireAuth, getOpportunitiesByProjectController);
router.patch("/opportunity/:opportunityId", updateOpportunityStateController);
router.patch("/opportunity/:opportunityId/full", UpdateOpportunityById);
router.delete("/opportunity/:opportunityId", deleteOpportunityById);
router.patch("/update-opportunity-order", updateOpportunityOrder);

export default router;
