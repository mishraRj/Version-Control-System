const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");
const Commit = require("../models/Commit");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function pullRepo(commitId) {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const commit = await Commit.findOne({ commitId });

    if (!commit || !Array.isArray(commit.files)) {
      console.error("❌ Commit not found or invalid format");
      await mongoose.disconnect();
      return;
    }

    const repoPath = path.join(process.cwd(), ".rjGit", "commits", commitId);
    await fs.mkdir(repoPath, { recursive: true });

    for (let file of commit.files) {
      const decoded = Buffer.from(file.content, "base64").toString("utf8");
      await fs.writeFile(path.join(repoPath, file.fileName), decoded);
    }

    await fs.writeFile(
      path.join(repoPath, "commit.json"),
      JSON.stringify({ message: commit.message, date: commit.date })
    );

    console.log(`✅ Pulled commit ${commitId}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during pull:", err.message);
    process.exit(1);
  }
}

module.exports = { pullRepo };
