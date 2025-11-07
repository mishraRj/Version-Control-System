const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");
const Commit = require("../models/Commit");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function pushRepo() {
  try {
    // ✅ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);

    const commitDir = path.join(process.cwd(), ".rjGit", "commits");
    const commitFolders = await fs.readdir(commitDir);

    for (const commitId of commitFolders) {
      const files = await fs.readdir(path.join(commitDir, commitId));
      const commitJson = JSON.parse(
        await fs.readFile(path.join(commitDir, commitId, "commit.json"), "utf8")
      );

      const fileContents = [];

      for (let file of files) {
        if (file === "commit.json") continue;
        const content = await fs.readFile(
          path.join(commitDir, commitId, file),
          "utf8"
        );
        fileContents.push({
          fileName: file,
          content: Buffer.from(content).toString("base64"),
        });
      }

      await Commit.create({
        commitId,
        files: fileContents,
        message: commitJson.message,
        date: commitJson.date,
        repository: commitJson.repoId, // <--- Main update
      });

      console.log(`✅ Pushed commit ${commitId} to repo ${commitJson.repoId}`);
    }

    await mongoose.disconnect(); // 🧹 Disconnect DB
    process.exit(0); // ✅ Exit like real CLI
  } catch (err) {
    console.error("❌ Error during push:", err.message);
    process.exit(1);
  }
}

module.exports = { pushRepo };
