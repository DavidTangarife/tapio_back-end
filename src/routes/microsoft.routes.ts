import { Router } from "express";
import { loginWithMicrosoft, handleMicrosoftRedirect } from "../controllers/microsoft.controller"

const microsoftRouter = Router();

microsoftRouter.get("/microsoft-login", loginWithMicrosoft);
microsoftRouter.get("/microsoft-redirect", handleMicrosoftRedirect);

export default microsoftRouter;
