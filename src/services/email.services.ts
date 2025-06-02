import Email from "../models/email.model"
import { Types } from "mongoose";


export async function getEmailsByProject(projectId: string) {
  return await Email.findByProjectId(new Types.ObjectId(projectId));
}


/**
 * Saves an array of parsed email objects to the database in a single bulk insert.
 * Uses `insertMany` with `ordered: false` to allow partial success.
 * If some emails fail to insert, retries them one by one.
 * @parsedEmailArray: Array of email objects parsed from IMAP to save in DB.
 */
export async function saveEmailsFromIMAP(parsedEmailArray: any[]): Promise<void> {
  if (!Array.isArray(parsedEmailArray) || parsedEmailArray.length === 0) {
    console.warn("No emails to save.");
    return;
  }
  const emailsToInsert = parsedEmailArray.map(email => ({
    ...email,
    createdAt: new Date(),
  }));

  try {
    await Email.insertMany(emailsToInsert, { ordered: false });
    console.log(`Inserted ${emailsToInsert.length} emails`);
  } catch (err: any) {
    if (err.writeErrors) {
      console.warn(`${err.writeErrors.length} emails failed. Retrying individually...`);

      for (const writeError of err.writeErrors) {
        const failedEmail = writeError.getOpertaion();

        try {
          await Email.create(failedEmail);
          console.log("Retried and saved one failed email.");
        } catch (singleErr) {
          console.error("Retry failed for one email:", singleErr);
        }
      }
    } else {
      console.error("Unexpected insert error:", err);
    }
  }
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