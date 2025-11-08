const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message, repoId) {
  const repoPath = path.resolve(process.cwd(), ".rjGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });
    const files = await fs.readdir(stagedPath);

    // Copy staged files into new commit folder
    for (let file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    // Write the commit.json file (message, date, repoId)
    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({ message, date: new Date().toISOString(), repoId })
    );

    // ===> ADD THIS CODE HERE, AFTER COMMIT IS SUCCESSFUL! <===
    // Clear the staged folder!
    const stagedFiles = await fs.readdir(stagedPath);
    for (const file of stagedFiles) {
      await fs.unlink(path.join(stagedPath, file));
    }

    console.log(
      `Commit with commitId: ${commitID} created with msg: ${message} (Repo: ${repoId})`
    );
  } catch (err) {
    console.log("Error adding file", err);
  }
}

module.exports = { commitRepo };
