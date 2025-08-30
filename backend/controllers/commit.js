const fs = require("fs").promises; // fs - file system, provided by node to create new files/folders
const path = require("path"); // provides the path of file
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".rjGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });
    const files = await fs.readdir(stagedPath);

    for (let file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );

      await fs.writeFile(
        path.join(commitDir, "commit.json"),
        JSON.stringify({ message, date: new Date().toISOString() })
      );

      console.log(
        `Commit with commitId: ${commitID} created with msg: ${message}`
      );
    }
  } catch (err) {
    console.log("Error adding file", err);
  }
}

module.exports = { commitRepo };
