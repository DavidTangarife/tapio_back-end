import { NextFunction, Request, Response } from "express";
import {
  getUserName,
  updateUserFullName,
  findOrCreateUserFromGoogle,
} from "../services/user.services";

export const handleUpdateUserName = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { fullName } = req.body;
  const userId = req.session.user_id;
  // console.log(userId);
  if (!fullName) {
    return res.status(400).json({ error: "Full name is required." });
  }
  try {
    const updateUser = await updateUserFullName(userId, fullName);
    // console.log("Request body:", req.body);

    res.status(200).json(updateUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleGetUserName = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const fullName = await getUserName(userId);

    if (!fullName) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ fullName });
  } catch (error) {
    console.error("Error fetching user name:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export async function handleGoogleAuth(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { email, refresh_token } = req.body;

    if (!email || !refresh_token) {
      return res.status(400).json({ message: "Missing email or refreshToken" });
    }

    const user = await findOrCreateUserFromGoogle({ email, refresh_token });

    res.status(200).json({ message: "User signed in via Google", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

export const checkForUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.session.user_id

  if (!userId) {
    return res.status(400).json({ user: false })
  } else {
    return res.status(200).json({ user: true })
  }
}

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err: any) => {
    if (err) next(err)
    res.status(200).json({ logout: true })
  })
}
