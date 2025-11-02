const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  content: [
    {
      type: String,
    },
  ],
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
});

RepositorySchema.pre("findOneAndDelete", async function (next) {
  const Issue = require("./issueModel");
  const repo = await this.model.findOne(this.getQuery());
  if (repo) {
    await Issue.deleteMany({ repository: repo._id });
  }
  next();
});

// After deleting an issue, pull its id from User's repo array
RepositorySchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.owner) {
    try {
      const User = require("./userModel");
      await User.updateOne(
        { _id: doc.owner },
        { $pull: { repositories: doc._id } }
      );
    } catch (e) {
      // log the error, do NOT throw or return error
      console.error("❌ Post-remove from issues array failed", e);
    }
  }
});

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
