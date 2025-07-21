import express from "express";
import requireAuth from "../middleware/require-auth";
import { getTemplates, saveTemplate } from "../controllers/template.controller";
const router = express.Router();

router.get('/templates', requireAuth, getTemplates)
router.post('/save-template', requireAuth, saveTemplate)
export default router;
