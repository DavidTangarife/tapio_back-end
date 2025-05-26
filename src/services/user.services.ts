import { Types } from "mongoose";
import User, {IUser} from "../models/user.model"

interface GoogleUserData {
  email: string;
  refreshToken: string;
}

/* Create user or return existing one */
export async function findOrCreateUserFromGoogle(googleUserData: GoogleUserData): Promise<IUser> {
  const { email, refreshToken } = googleUserData;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email, refreshToken });
  } else {
    // update refresh token if changed
    if (user.refreshToken !== refreshToken) {
      user.refreshToken = refreshToken;
      await user.save();
    }
  }
  return user;
};

/* Update full name after user has authenticated */
export async function updateUserFullName(userId: string | Types.ObjectId, fullName: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.fullName = fullName.trim();
  await user.save();
  return user;
}

/* Return a user using email */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({ email });
};