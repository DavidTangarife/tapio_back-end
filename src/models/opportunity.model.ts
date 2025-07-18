import { Schema, model, Document, Types, Model } from "mongoose";
import Project from "./project.model";

interface IOpportunity extends Document {
  projectId: Types.ObjectId;
  statusId: Types.ObjectId;
  title: string;
  company: {
    name: string;
    logoUrl: string;
    brandColor: string;
  };
  isRejected?: boolean;
  jobAdUrl?: string;
  snippets?: [Object];
  description?: {
    location: string;
    type: string;
    salary: string;
    posted: string;
  };
  position: number;
  success?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IOpportunityModel extends Model<IOpportunity> {
  findOppByProjectId: (projectId: Types.ObjectId) => Promise<IOpportunity[]>;
  findOppByStatusId: (statusId: Types.ObjectId) => Promise<IOpportunity[]>;
}

const opportunitySchema = new Schema<IOpportunity>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    statusId: { type: Schema.Types.ObjectId, ref: "Status", required: true },
    title: { type: String, required: true, trim: true },

    company: {
      name: { type: String, required: true, trim: true },
      logoUrl: { type: String, default: "" }, // handled in backend
      brandColor: { type: String, default: "" },
    },
    isRejected: { type: Boolean, default: false },
    jobAdUrl: {
      type: String,
      validate: {
        validator: (v: string) => /^https?:\/\/.+/.test(v),
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    snippets: {
      type: [Object],
      default: [],
    },
    description: {
      location: { type: String, default: "" },
      type: { type: String, default: "" },
      salary: { type: String, default: "" },
      posted: { type: String, default: "" },
    },
    position: { type: Number },
    success: { type: Boolean, default: false}
  },
  {
    timestamps: true,
  }
);

// Static method
opportunitySchema.statics.findOppByProjectId = async function(
  projectId: Types.ObjectId
) {
  return this.find({ projectId });
};
opportunitySchema.statics.findOppByStatusId = async function(
  statusId: Types.ObjectId
) {
  return this.find({ statusId });
};

// pre saving validation
opportunitySchema.pre("validate", async function(next) {
  const project = await Project.findById(this.projectId);
  if (!project) {
    return next(new Error("Project does not exist."));
  }
  next();
});

/* Show a message before saving */
opportunitySchema.pre("save", function(next) {
  if (this.isNew) {
    console.log("Creating new opportunity...");
  }
  next();
});

/* Show a message after saving */
opportunitySchema.post("save", function(doc) {
  console.log(`Opportunity saved: ${doc._id}`);
});

export default model<IOpportunity, IOpportunityModel>(
  "Opportunity",
  opportunitySchema
);
