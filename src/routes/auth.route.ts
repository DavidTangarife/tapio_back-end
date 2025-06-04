import requireAuth from "../middleware/require-auth"
import express from "express";
import { Request, Response } from "express";

const router = express.Router();

// Test to protect the API endpoint. Just put it in the route definition like this
// It will execute before the request reaches the function that proceses a request
// response here is just to test.
router.get("/test", requireAuth, async (req, res) => {
  res.json({ 
    message: "Welcome to test auth",
    userId: req.session.user_id,
    sessionData: req.session 
   });
});

//Logout to end a user's session
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session termination error", err);
      return res.status(500).json ({ error: err.message });
    }
    res.clearCookie('connect.sid')
    res.json({ message: "Logged out successfully " });
    res.redirect('/')
  });
});

export default router;