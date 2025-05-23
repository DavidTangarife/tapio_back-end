const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  from: String,
  subject: String,
  date: Date,
});

const EmailModel = mongoose.model("EmailInfo", emailSchema);

const emails = [
  {
    from: "jacob@example.com",
    subject: "Tapioooooochuuuuu",
    date: new Date("2024-05-01"),
  },
  {
    from: "Max@example.com",
    subject: "Baguels are the best",
    date: new Date("2024-05-02"),
  },
  {
    from: "Mahsa@example.com",
    subject: "Cant be bother at 7 am",
    date: new Date("2024-05-03"),
  },
];

async function init() {
  try {
    await mongoose.connect("mongodb://mongo:27017/mydb");
    console.log("Connected to MongoDB");
    await EmailModel.deleteMany({}); //  clear existing emails no need of it 
    await EmailModel.insertMany(emails);
    console.log("Emails inserted");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();
