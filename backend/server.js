// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");
const Commit = require("./models/commit"); // keep as used

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/", mainRouter);

// Mongoose
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to DB ✅");
  })
  .catch(err => {
    console.log("❌Error connecting to DB!!!", err);
  });

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
