import { Schema, model, Document, Types } from "mongoose";

interface IEmail extends Document {
  projectId: Types.ObjectId;
  // opportunityId?: Types.ObjectId;
  mailBoxId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: Date;
  isRead?: boolean;
  isTapped?: boolean;
  isDeleted?: boolean;
  isReplied?: boolean;
  isoutgoing?: boolean;
  threadId?: string;
  body: string;
  createdAt: Date;
  // raw: {};
}

const emailSchema = new Schema<IEmail>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  // opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity" },
  mailBoxId: { type: String },
  subject: { type: String },
  from: { type: String, required: true },
  to: [{ type: String, required: true }],
  cc: [{ type: String }],
  bcc: [{ type: String }],
  date: { type: Date },
  isRead: { type: Boolean, default: false},
  isTapped: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isReplied: { type: Boolean, default: false },
  isoutgoing: { type: Boolean, default: false },
  threadId: { type: String },
  body: { type: String },
  createdAt: { type: Date },
  // raw: { type: String } 
});

export default model<IEmail>("Email", emailSchema);
