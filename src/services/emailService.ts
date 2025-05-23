import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  from: String,
  subject: String,
  date: Date,
});

export const EmailModel = mongoose.model("EmailInfo", emailSchema);

export const getAllEmails = async () => {
  return await EmailModel.find();
};
