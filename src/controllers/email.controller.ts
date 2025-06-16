import Email from "../models/email.model";
import Project from "../models/project.model";
import User from "../models/user.model"
import {Request, Response} from 'express';
import {getFilteredEmails, saveEmailsFromIMAP} from "../services/email.services"
import { get_imap_connection, sender_and_subject_since_date_callback } from "../services/imap";
import { Types } from "mongoose";
import { get_xoauth2_generator, get_xoauth2_token } from "../services/xoauth2";
// import { getEmailsByProject } from "../services/email.services";

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

// export const getEmailByProjectId = async (req: Request, res: Response) => {
//   try {
//     const emails: any = await getEmailsByProject("682efb5211da37c9c95e0779");
//     res.status(200).json(emails);
//   } catch (err) {
//     console.error("Failed to fetch emails:", err);
//     res.status(500).json({ message: "Server error while fetching emails" });
//   }
// }

export const fetchEmailsController = async (req: Request, res: Response) : Promise<any> => {
  console.log('fetchEmailsController called')
  try {
    const { projectId } = req.body;
    console.log(new Types.ObjectId(String(projectId)))
    const userId  = req.session.user_id;
    console.log(userId)
     if (!userId || !projectId) {
      return res.status(400).json({ error: "Missing userId or projectId" });
    }

    const user = await User.findById(userId);
    if (!user || !user.email || !user.refresh_token) {
      return res.status(401).json({ error: "Email account not connected" });
    } 
    

    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    // Find the project to get createdAt date
    const project = await Project.findById(new Types.ObjectId(String(projectId)));
    if (!project) return res.status(404).json({ error: "Project not found" });
    console.log(project)
    const xoauth2gen = get_xoauth2_generator(user.email, user.refresh_token);
    const xoauth2Token = await get_xoauth2_token(xoauth2gen);
    const imap = get_imap_connection(user.email, xoauth2Token);
    console.log("imap connected")
    const dateStr = project.startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }); 
    console.log(dateStr)
    const emails: any = sender_and_subject_since_date_callback(imap, dateStr, projectId, async (emails) => {
      console.log('Fetched emails:', emails);
      await saveEmailsFromIMAP(emails);
      res.status(201).json(emails)
    });
    console.log(emails)
    
   
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const fetchFilteredEmails = async (req: Request, res: Response) => {
  try {
    const {projectId} = req.params;
    // const projectId = req.session.project_id;
    // if (!projectId) {
    //   return res.status(404).json({ error: "There is no project in session" });
    // }
    const emails = await getFilteredEmails(projectId);
    console.log(emails)
    res.status(200).json(emails);
  } catch (err: any) {
    console.error("Failed to get filtered emails:", err.message);
    res.status(500).json({ error: "Failed to get emails." });
  }
};