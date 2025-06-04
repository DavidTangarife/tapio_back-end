import {Request, Response} from 'express';
import { findOrCreateUserFromGoogle, updateUserFullName } from '../services/user.services';
import { ObjectId } from 'bson';

export const handleUpdateUserName = async (req: Request, res: Response) :Promise<any> => {
  const { userId, fullName } = req.body;
  // console.log("Request body:", req.body);
  if (!fullName) {
    return res.status(400).json({ error: "Full name is required." });
  }
  try {
    const updateUser = await updateUserFullName(
      new ObjectId(String(userId)),
      fullName
    );
    // console.log("Request body:", req.body);

    res.status(200).json(updateUser);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};


export async function handleGoogleAuth(req: Request, res: Response) :Promise<any> {
  try {
    const { email, refreshToken } = req.body;

    if (!email || !refreshToken) {
      return res.status(400).json({ message: "Missing email or refreshToken" });
    }

    const user = await findOrCreateUserFromGoogle({ email, refreshToken });

    res.status(200).json({ message: "User signed in via Google", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}