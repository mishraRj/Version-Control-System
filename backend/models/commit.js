const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("Commit", commitSchema);
