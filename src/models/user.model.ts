import mongoose, { Schema, model, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName?: string;
  email: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;

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
    unique: true,
  },
  refreshToken: {
    type: String,
    required: [true, 'Refresh token is required']
  },
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
userSchema.pre("save", function (next) {
  if (this.isNew) {
    console.log("Creating new user...");
  }
  next();
});

// Show a message after saving
userSchema.post("save", function (doc) {
  console.log(`User saved: ${doc._id}`);
});

export default model<IUser>("User", userSchema);
