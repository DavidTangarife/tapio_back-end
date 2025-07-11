import { Types } from "mongoose";
import User, { IUser } from "../models/user.model"

interface GoogleUserData {
  email: string;
  refresh_token: string;
}

interface MicrosoftUserData {
  email: string;
  token_cache: string;
}

/* Create user or return existing one */
export async function findOrCreateUserFromGoogle(googleUserData: GoogleUserData): Promise<IUser> {
  const { email, refresh_token } = googleUserData;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email, refresh_token, onBoarded: false });
    return user;
  } else {
    // update refresh token if changed
    if (user.refresh_token !== refresh_token) {
      user.refresh_token = refresh_token;
      await user.save();
    }
  }
  return user;
};

export async function findOrCreateUserFromMicrosoft(microsoftUserData: MicrosoftUserData): Promise<IUser> {
  const { email, token_cache } = microsoftUserData;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email, token_cache, onBoarded: false });
    return user;
  } else {
    // update token cache if changed
    if (user.token_cache !== token_cache) {
      user.token_cache = token_cache;
      await user.save();
    }
  }
  return user;

}

export async function onboardUser(_id: string, project_id: string) {
  const user = await User.findOne({ _id });

  if (!user) {
    console.log('Failed to onboard user ' + _id)
  } else {
    user.onBoarded = true;
    user.lastProject = project_id
    await user.save();
  }

}

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

/* Return a user's name */
export async function getUserName(userId: string) {
  const user = await User.findById(userId).select("fullName");
  return user ? user.fullName : null;
};

/* Return a user using id */
export async function getUserById(_id: string): Promise<IUser | null> {
  return await User.findOne({ _id });
};
