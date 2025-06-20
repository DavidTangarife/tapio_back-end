import { Router } from "express";
import { loginWithMicrosoft, handleMicrosoftRedirect, getMicrosoftEmailsByDate } from "../controllers/microsoft.controller"

const microsoftRouter = Router();

microsoftRouter.get("/microsoft-login", loginWithMicrosoft);
microsoftRouter.get("/microsoft-redirect", handleMicrosoftRedirect);
microsoftRouter.get("/microsoft-emails", getMicrosoftEmailsByDate);

export default microsoftRouter;
