// index.js (CLI-only)
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pullRepo } = require("./controllers/pull");
const { pushRepo } = require("./controllers/push");
const { revertRepo } = require("./controllers/revert");
const { pullAllRepo } = require("./controllers/pull-all");

yargs(hideBin(process.argv))
  .command("init", "Initialize a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add file to the repository",
    yargs => {
      yargs.positional("file", {
        describe: "file to add to the staging area",
        type: "string",
      });
    },
    argv => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message> <repoId>",
    "Commit the staged files",
    yargs => {
      yargs
        .positional("message", {
          describe: "Commit Message",
          type: "string",
        })
        .positional("repoId", {
          describe: "Repository ID to link this commit to",
          type: "string",
        });
    },
    argv => {
      commitRepo(argv.message, argv.repoId);
    }
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command(
    "pull <commitID>",
    "Pull commit by ID",
    yargs => {
      yargs.positional("commitID", {
        describe: "ID of the commit to pull",
        type: "string",
      });
    },
    argv => {
      pullRepo(argv.commitID);
    }
  )
  .command("pull-all", "Pull all commits", {}, pullAllRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    yargs => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    argv => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;
