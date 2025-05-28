import Email from "../models/email.model"
import { Types } from "mongoose";


export async function getEmailsByProject(projectId: string) {
  return await Email.findByProjectId(new Types.ObjectId(projectId));
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function insertEmailsInBatches(emails: any[], batchSize = 99, delayMs = 1000): Promise<void> {
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize).map(email => ({
      ...email,
    //   to: email.to?.length ? email.to : [userEmail], 
      createdAt: new Date(),
    }));

    try {
      await Email.insertMany(batch, { ordered: false });
      console.log(`Inserted batch ${i / batchSize + 1}`);
    } catch (err) {
      console.error("Error inserting batch:", err);
    }

    await delay(delayMs); // throttle to stay under MongoDB Atlas limit
  }
}

// 
export async function saveEmailsFromIMAP(parsedEmailArray: any[]): Promise<void> {
  if (!Array.isArray(parsedEmailArray) || parsedEmailArray.length === 0) {
    console.warn("No emails to save.");
    return;
  }

  await insertEmailsInBatches(parsedEmailArray);
}

/* Reply an email */
// export async function replyToEmail(emailId: string, replyBody: string) {
//   const email = await Email.findById(emailId);
//   if (!email) throw new Error("Email not found");

//   // Logic to send the reply...
//   email.isReplied = true;
//   await email.save();

//   return email;
// }