import mongoose, { Schema, model, Document, Model, ObjectId } from "mongoose";
import User from "./user.model";
import { Types } from "mongoose";

export interface ITemplate extends Document {
  templateName: string;
  text: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods type
interface ITemplateModel extends Model<ITemplate> {
  findByUserId: (userId: Types.ObjectId) => Promise<ITemplate | null>;
}

const templateSchema = new Schema<ITemplate>({
  templateName: {
    type: String,
    required: [true, 'Template Name is required'],
    unique: false
  },
  text: {
    type: String,
    required: [true, 'Template Text is required'],
    unique: false
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
},
  {
    timestamps: true
  }
);

/* validate userId exists */
templateSchema.pre("validate", async function(next) {
  const user = await User.findById(this.userId);
  if (!user) {
    return next(new Error("User does not exist."));
  }
  next();
});

// static method
templateSchema.statics.findByUserId = function(userId: string | Types.ObjectId) {
  return this.find({ userId });
};

/* Show a message before saving */
templateSchema.pre("save", function(next) {
  if (this.isNew) {
    console.log("Creating new Template...");
  }
  next();
});

/* Show a message after saving */
templateSchema.post("save", function(doc) {
  console.log(`Template saved: ${doc._id}`);
});

export default model<ITemplate, ITemplateModel>("Template", templateSchema);
