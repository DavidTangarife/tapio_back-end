import { Schema, model, Document, Types, Model } from "mongoose";
import Project from "./project.model"


interface Snip {
  label: string;   // "Deadline", "Contact name"
  value: string;   // "15 March", "John"
}

interface IOpportunity extends Document {
  projectId: Types.ObjectId;
  statusId: Types.ObjectId;
  emailId: Types.ObjectId;
  title: string;
  company: {
    name: string;
    faviconUrl: string;
  };
  isRejected?: boolean;
  jobAdUrl?: string;
  snips?: Snip[];
  createdAt: Date;
  updatedAt: Date;
}

interface IOpportunityModel extends Model<IOpportunity> {
  findOppByProjectId: (projectId: Types.ObjectId) => Promise<IOpportunity[]>;
  findOppByStatusId: (statusId: Types.ObjectId) => Promise<IOpportunity[]>;
}

const opportunitySchema = new Schema<IOpportunity>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  statusId: { type: Schema.Types.ObjectId, ref: "Status", required: true },
  emailId: { type: Schema.Types.ObjectId, ref: "Email", required: true },
  title: { type: String, required: true, trim: true },

  company: {
    name: { type: String, required: true, trim: true },
    faviconUrl: { type: String, default: "" }, // handled in backend
  },
  isRejected: { type: Boolean, default: false },
  jobAdUrl: {
    type: String,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: props => `${props.value} is not a valid URL`,
    },
  },
  snips: {
    type: [{ label: String, value: String }],
    default: [],
  },
}, {
  timestamps: true,
});


// Static method
opportunitySchema.statics.findOppByProjectId = async function(projectId: Types.ObjectId) {
  return this.find({ projectId })
}
opportunitySchema.statics.findOppByStatusId = async function(statusId: Types.ObjectId) {
  return this.find({ statusId })
}

// pre saving validation
opportunitySchema.pre("validate", async function (next) {
  const project = await Project.findById(this.projectId);
  if (!project) {
    return next(new Error("Project does not exist."));
  }
  next();
});

/* Show a message before saving */
opportunitySchema.pre("save", function (next) {
  if (this.isNew) {
    console.log("Creating new opportunity...");
  }
  next();
});

/* Show a message after saving */
opportunitySchema.post("save", function (doc) {
  console.log(`Opportunity saved: ${doc._id}`);
});

export default model<IOpportunity, IOpportunityModel>("Opportunity", opportunitySchema);
