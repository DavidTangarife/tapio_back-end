import express from "express";
import { getEmailByProjectId } from "../controllers/email.controller";

const router = express.Router();

router.get("/getemails", getEmailByProjectId);

export default router;