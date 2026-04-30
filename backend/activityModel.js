const mongoose = require("mongoose");
const { Schema } = mongoose;

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // "commit", "repo", "issue", etc.
  target: { type: String }, // repoId, issueId, or a short message
  description: { type: String }, // Optional: commit message, repo name, etc.
  timestamp: { type: Date, default: Date.now }, // When action happened
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
