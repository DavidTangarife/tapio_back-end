import {Request, Response} from 'express';
import { findOrCreateUserFromGoogle, updateUserFullName } from '../services/user.services';
import { ObjectId } from 'bson';

export const handleUpdateUserName = async (req: Request, res: Response) :Promise<any> => {
  const {  fullName } = req.body;
  const userId = req.session.user_id;
  console.log("🔥 PATCH /update-name hit");
  console.log(userId);
  if (!fullName) {
    return res.status(400).json({ error: "Full name is required." });
  }
  try {
    const updateUser = await updateUserFullName(
      userId,
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