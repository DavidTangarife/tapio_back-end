import { Request, Response } from "express";
import { getAllEmails } from "../services/emailService";

export const fetchEmails = async (_req: Request, res: Response) => {
  const emails = await getAllEmails();
  res.json(emails);
};
