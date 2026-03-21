const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const mainRouter = require("./routes/main.router");
const Commit = require("./models/commit"); // keep as used
const errorHandler = require("./middlewares/errorHandler");
const ExpressError = require("./utils/ExpressError");
const { initSocket } = require("./socket");

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

const httpServer = http.createServer(app);
const io = initSocket(httpServer);

const db = mongoose.connection;
db.once("open", async () => {
  console.log("CRUD operations called!");
});

// Error Handling
// ----------
app.all("/{*any}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use(errorHandler);
// ----------

httpServer.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
