import { NextFunction, Request, Response } from "express";

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    console.log("checking your session")
    if (!req.session.user_id) {
        res.status(401).json({ error: "Unauthorized access: Please login" });
        return;
    }
    next();
};
export default requireAuth;