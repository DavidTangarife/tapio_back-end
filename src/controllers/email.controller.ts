import Email from "../models/email.model";
import Project from "../models/project.model";
import {Request, Response} from 'express';
import {saveEmailsFromIMAP} from "../services/email.services"
import { getEmailsByProject } from "../services/email.services";

// export const saveEmail = async (req: Request, res: Response) => {
//   const { mailBoxId,
//       subject,
//       from
//       } = req.body;

//   try{

//     const newEmail = new Email({
//       projectId: "682efb5211da37c9c95e0779",
//       mailBoxId,
//       subject,
//       from
//     });

//     const savedEmail = await newEmail.save();
//     res.status(201).json(savedEmail);
//   } catch (error) {
//     console.error("Error saving email:", error);
//     res.status(500).json({ error: "Failed to save email" });
//   }
// };

export const getEmailByProjectId = async (req: Request, res: Response) => {
  try {
    const emails: any = await getEmailsByProject("682efb5211da37c9c95e0779");
    res.status(200).json(emails);
  } catch (err) {
    console.error("Failed to fetch emails:", err);
    res.status(500).json({ message: "Server error while fetching emails" });
  }
}
