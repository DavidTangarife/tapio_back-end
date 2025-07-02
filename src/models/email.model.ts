import {
  Schema,
  model,
  Document,
  Types,
  Model,
  WithoutUndefined,
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
  isTapped?: boolean;
  isDeleted?: boolean;
  isReplied?: boolean;
  isOutgoing?: boolean;
  isApproved?: boolean;
  isProcessed?: boolean;
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
  findByOppoId: (projectId: Types.ObjectId) => Promise<IEmail | null>;
}

const emailSchema = new Schema<IEmail>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity" },
    mailBoxId: { type: String, unique: [true, "Email must be unique"] },
    subject: { type: String },
    snippet: { type: String, required: false },
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    bcc: [{ type: String }],
    date: { type: Date },
    isRead: { type: Boolean, default: false },
    isTapped: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    isOutgoing: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: null },
    isProcessed: { type: Boolean, default: false },
    threadId: { type: String },
    body: { type: String },
    raw: { type: String },
  },
  {
    timestamps: true,
  }
);

// emailSchema.index({ mailBoxId: 1, projectId: 1 }, { unique: true });

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

// Static method email by project
emailSchema.statics.findByProjectId = async function (
  projectId: Types.ObjectId
) {
  return this.find({ projectId });
};

// Static method emails by opportunity
emailSchema.statics.findByOppoId = async function (
  opportunityId: Types.ObjectId
) {
  return this.find({ opportunityId });
};

emailSchema.post("save", function (doc) {
  console.log(`Email saved: ${doc._id}`);
});

export default model<IEmail, IEmailModel>("Email", emailSchema);
