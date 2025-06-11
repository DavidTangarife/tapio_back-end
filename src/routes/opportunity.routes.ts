import express from "express";
import { createOpportunityController } from "../controllers/opportunity.controller";

const router = express.Router();

router.post("/opportunity", createOpportunityController);

export default router;