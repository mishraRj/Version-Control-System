const mongoose = require("mongoose");
const { Schema } = mongoose;

const commitSchema = new mongoose.Schema({
  commitId: String,
  files: [
    {
      fileName: String,
      content: String, // base64 encoded
    },
  ],
  message: String,
  date: Date,
  repository: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
});

module.exports = mongoose.model("Commit", commitSchema);
