import {
  Schema,
  model,
  Document,
  Types,
  Model,
} from "mongoose";

export interface IEmail extends Document {
  projectId: Types.ObjectId;
  opportunityId: Types.ObjectId;
  mailBoxId: string;
  subject: string;
  snippet: string;
  from: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  date?: Date;
  isRead?: boolean;
  isProcessed?: boolean;
  isApproved?: boolean;
  isTapped?: boolean;
  isDeleted?: boolean;
  isReplied?: boolean;
  isOutgoing?: boolean;
  threadId?: string;
  body?: string;
  createdAt: Date;
  updatedAt: Date;
  raw?: {};
  updateStatus(
    updates: Partial<
      Pick<
        IEmail,
        | "isRead"
        | "isReplied"
        | "isOutgoing"
        | "isTapped"
        | "isDeleted"
        | "isApproved"
        | "isProcessed"
      >
    >
  ): Promise<void>;
}

// Static methods type
interface IEmailModel extends Model<IEmail> {
  findByProjectId: (projectId: Types.ObjectId) => Promise<IEmail | null>;
}


const emailSchema = new Schema<IEmail>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  // opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity" },
  mailBoxId: { type: String, unique: [true, 'Email must be unique'] },
  subject: { type: String },
  snippet: { type: String, required: false },
  from: { type: String, required: true },
  to: [{ type: String, required: true }],
  cc: [{ type: String }],
  bcc: [{ type: String }],
  date: { type: Date },
  isRead: { type: Boolean, default: false },
  isProcessed: { type: Boolean, default: false },
  isApproved: { type: Boolean }, //if the user processed and want to keep it is true
  isTapped: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isReplied: { type: Boolean, default: false },
  isOutgoing: { type: Boolean, default: false },
  threadId: { type: String },
  body: { type: String },
  raw: { type: String },
}, {
  timestamps: true
}
);

emailSchema.index({ subject: "text", from: "text" });

// Instance method
emailSchema.methods.updateStatus = async function (
  updates: Partial<
    Pick<
      IEmail,
      | "isRead"
      | "isReplied"
      | "isOutgoing"
      | "isTapped"
      | "isDeleted"
      | "isApproved"
      | "isProcessed"
    >
  >
) {
  Object.assign(this, updates);
  await this.save();
};

// Static method
emailSchema.statics.findByProjectId = async function (
  projectId: Types.ObjectId
) {
  return this.find({ projectId });
};

emailSchema.post("save", function (doc) {
  console.log(`Email saved: ${doc._id}`);
});

export default model<IEmail, IEmailModel>("Email", emailSchema);
