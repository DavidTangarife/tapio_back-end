import mongoose, { Schema, model, Document, Model, ObjectId } from "mongoose";
import { Types } from "mongoose";

export interface IUser extends Document {
  fullName?: string;
  email: string;
  refresh_token?: string;
  token_cache?: string;
  last_project_id?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastProject?: string;
  onBoarded: boolean;
  inboxConnected: boolean;

  updateFullName(newName: string): Promise<void>;
}

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    minlength: [3, 'Full name must be at least 3 characters long'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email must be unique']
  },
  refresh_token: {
    type: String,
  },
  token_cache: {
    type: String,
  },
  lastProject: {
    type: String,
    ref: "Project"
  },
  onBoarded: {
    type: Boolean
  },
  inboxConnected: {
    type: Boolean
  }
}, {
  timestamps: true
}
);

// Instance method
userSchema.methods.updateFullName = async function(newName: string) {
  this.fullName = newName.trim();
  this.updatedAt = new Date();
  await this.save();
};

// Show a message before saving
userSchema.pre("save", function(next) {
  if (this.isNew) {
    console.log("Creating new user...");
  }
  next();
});

// Show a message after saving
userSchema.post("save", function(doc) {
  console.log(`User saved: ${doc._id}`);
});

export default model<IUser>("User", userSchema);
