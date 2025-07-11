import { Schema, model, Document, Types } from "mongoose";

interface ISchema extends Document {
  projectId: Types.ObjectId;
  title: string;
  order?: Number;
  color?: string;
  deletable:Boolean;
  createdAt: Date;
  updatedAt: Date;
}

const statusSchema = new Schema<ISchema>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number },
    color: { type: String, default: "gray" },
    deletable: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

export default model<ISchema>("Status", statusSchema);
