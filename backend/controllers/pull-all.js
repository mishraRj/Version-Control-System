const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");
const Commit = require("../models/Commit");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function pullAllRepo() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const commits = await Commit.find();

    for (const commit of commits) {
      const commitId = commit.commitId;
      const commitDir = path.join(process.cwd(), ".rjGit", "commits", commitId);
      await fs.mkdir(commitDir, { recursive: true });

      for (let file of commit.files) {
        const decoded = Buffer.from(file.content, "base64").toString("utf8");
        await fs.writeFile(path.join(commitDir, file.fileName), decoded);
      }

      await fs.writeFile(
        path.join(commitDir, "commit.json"),
        JSON.stringify({
          message: commit.message,
          date: commit.date,
        })
      );

      console.log(`✅ Pulled commit ${commitId}`);
    }

    await mongoose.disconnect(); // ✅ close DB connection
    process.exit(0); // ✅ exit like a CLI tool
  } catch (err) {
    console.error("❌ Error pulling all commits:", err.message);
    process.exit(1);
  }
}

module.exports = { pullAllRepo };
