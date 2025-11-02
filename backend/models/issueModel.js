const mongoose = require("mongoose");
const { Schema } = mongoose;

const IssueSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  repository: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
});
// After deleting an issue, pull its id from repo's issues array
IssueSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.repository) {
    try {
      const Repository = require("./repoModel");
      await Repository.updateOne(
        { _id: doc.repository },
        { $pull: { issues: doc._id } }
      );
    } catch (e) {
      // log the error, do NOT throw or return error
      console.error("❌ Post-remove from issues array failed", e);
    }
  }
});

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;
