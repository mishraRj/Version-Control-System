const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Commit = require("./models/commit");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

require("dotenv").config();

const yargs = require("yargs"); // yargs helps us build CLI commands like 'init', 'add', 'commit' etc.
const { hideBin } = require("yargs/helpers"); // hideBin helps yargs ignore extra CLI stuff like 'node index.js' and only focus on our custom args
const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pullRepo } = require("./controllers/pull");
const { pushRepo } = require("./controllers/push");
const { revertRepo } = require("./controllers/revert");
const { pullAllRepo } = require("./controllers/pull-all");

yargs(hideBin(process.argv)) // sets up the CLI to read user input commands (like "add", "commit", etc.)
  .command("start", "start a new server", {}, startServer)
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
      pullRepo(argv.commitID); // ✅ Pass only the string ID
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
  .demandCommand(1, "You need at least one command") // force user to give a command
  .help().argv; // enable --help and runs the command

function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;
  app.use(bodyParser.json());
  app.use(express.json());

  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to DB ✅");
    })
    .catch(err => {
      console.log("❌Error connecting to DB!!!", err);
    });

  app.use(cors({ origin: "*" }));
  app.use("/", mainRouter);

  let user = "test";
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["Get", "Post"],
    },
  });

  io.on("connection", socket => {
    socket.on("joinRoom", userId => {
      user = userId;
      console.log("=========");
      console.log(user);
      console.log("=========");
      socket.join(userId);
    });
  });

  const db = mongoose.connection;

  db.once("open", async () => {
    console.log("CRUD operations called!");
  });

  httpServer.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
}
