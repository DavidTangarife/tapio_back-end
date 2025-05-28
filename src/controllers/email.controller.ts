// import Email from "../models/email.model";
// import Project from "../models/project.model";
// import {Request, Response} from 'express';


// export const saveEmail = async (req: Request, res: Response) => {
//   const { projectId, mailBoxId,
//       subject,
//       from,
//       to,
//       cc,
//       bcc,
//       date,
//       isRead,
//       isTapped,
//       isDeleted,
//       isReplied,
//       outgoing,
//       threadId,
//       body} = req.body;

//   try{
//     const projectExists = await Project.findById(projectId);
//     if (!projectExists) {
//       return res.status(404).json({ error: "Project not found" });
//     }
//     const newEmail = new Email({
//       projectId,
//       mailBoxId,
//       subject,
//       from,
//       to,
//       cc,
//       bcc,
//       date,
//       isRead,
//       isTapped,
//       isDeleted,
//       isReplied,
//       outgoing,
//       threadId,
//       body,
//       createdAt: new Date()
//     });

//     const savedEmail = await newEmail.save();
//     res.status(201).json(savedEmail);
//   } catch (error) {
//     console.error("Error saving email:", error);
//     res.status(500).json({ error: "Failed to save email" });
//   }
// };
