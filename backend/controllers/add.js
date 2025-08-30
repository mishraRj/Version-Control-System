const fs = require("fs").promises; // fs - file system, provided by node to create new files/folders
const path = require("path"); // provides the path of file

async function addRepo(filepath) {
  const repoPath = path.resolve(process.cwd(), ".rjGit");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filepath);
    await fs.copyFile(filepath, path.join(stagingPath, fileName));
    console.log(`file ${fileName} added to the staging area!`);
  } catch (err) {
    console.log("Error adding file", err);
  }
}

module.exports = { addRepo };
