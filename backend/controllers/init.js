const fs = require("fs").promises; // fs - file system, provided by node to create new files/folders
const path = require("path"); // path = helps safely create file/folder paths (OS-independent)

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".rjGit"); // process.cwd() gives path of current working directory
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.mkdir(repoPath, { recursive: true }); // recursive: true enables nesting of folder if already exists
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: process.env.S3_BUCKET })
    );
    console.log("Repository Initialized successfully");
  } catch (err) {
    console.log("Error in initializing the repo!!!", err);
  }
}

module.exports = { initRepo };
