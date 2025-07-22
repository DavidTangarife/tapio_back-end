import { Schema, model, Document, Types, Model } from "mongoose";
import User from "./user.model"; 
import Status from "./status.model";
import Opportunity from "./opportunity.model"

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  startDate: Date;
  filters: string[];
  blocked: string[];
  lastEmailSync?: Date;
  inboxConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Instance method
  // updateFilters: (newFilters: { keywords: string[]; senders: string[] }) => Promise<IProject>;
}

// Static methods type
interface IProjectModel extends Model<IProject> {
  findByUserId: (userId: Types.ObjectId) => Promise<IProject | null>;
}

const projectSchema = new Schema<IProject>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  filters: [{ type: String }],
  blocked: [{ type: String }],
  lastEmailSync: { type: Date },
  inboxConnected: {type: Boolean, default: false}
}, {
    timestamps: true
  }
);

// Instance method
// projectSchema.methods.updateFilters = function(newFilters: { keywords: string[]; senders: string[] }) {
//   this.filters = newFilters;
//   return this.save()
// }

// static method
projectSchema.statics.findByUserId = function (userId: string | Types.ObjectId) {
  return this.find({ userId });
};

/* Validation before storing in database */

/* unique project name for the user */
projectSchema.pre("validate", async function (next) {
  const existing = await this.model("Project").findOne({
    userId: this.userId,
    name: this.name,
    _id: { $ne: this._id } // ignore self on update
  });
  if (existing) {
    return next(new Error("Project name must be unique for the user."));
  }
  next();
});

/* validate startDate not in future or past more than month ago */
projectSchema.pre("validate", function(next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateLimit = new Date();
  dateLimit.setDate(today.getDate() - 30);
  dateLimit.setHours(0, 0, 0, 0);

  if (this.startDate) {
    const start = new Date(this.startDate);
    start.setHours(0, 0, 0, 0);

    if (start > today) {
      return next(new Error("Start date cannot be in the future."));
    }

    if (start < dateLimit) {
      return next(new Error("Start date cannot be more than 30 days ago."));
    }
  }
  next()
});

/* validate userId exists */
projectSchema.pre("validate", async function (next) {
  const user = await User.findById(this.userId);
  if (!user) {
    return next(new Error("User does not exist."));
  }
  next();
});

/* validate length of project name has to between 3 and 100 characters */
projectSchema.pre("validate", function (next) {
  if (this.name && (this.name.length < 3 || this.name.length > 100)) {
    return next(new Error("Project name must be between 3 and 100 characters."));
  }
  next();
});

/* Show a message before saving */
projectSchema.pre("save", function (next) {
  if (this.isNew) {
    console.log("Creating new project...");
  }
  next();
});

/* Show a message after saving */
projectSchema.post("save", function (doc) {
  console.log(`Project saved: ${doc._id}`);
});

// Delete status and opportunities as well when a project is deleted
projectSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
  const projectId = this._id;
  await Status.deleteMany({ projectId });
  await Opportunity.deleteMany({ projectId });
  next();
});

export default model<IProject, IProjectModel>("Project", projectSchema);