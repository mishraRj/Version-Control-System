const express = require("express");
const chatController = require("../controllers/chatController");
const chatRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");
const wrapAsync = require("../utils/wrapAsync");

chatRouter.post("/send", isLoggedIn, wrapAsync(chatController.sendMessage));
chatRouter.get(
  "/history/:otherUserId",
  isLoggedIn,
  wrapAsync(chatController.getChatHistory),
);
chatRouter.put(
  "/read/:otherUserId",
  isLoggedIn,
  wrapAsync(chatController.markMessagesRead),
);
chatRouter.get("/list", isLoggedIn, wrapAsync(chatController.getChatList));
chatRouter.delete(
  "/delete/:otherUserId",
  isLoggedIn,
  wrapAsync(chatController.deleteChat),
);

module.exports = chatRouter;
