import {Request, Response} from 'express';
import { updateUserFullName } from '../services/user.services';
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
