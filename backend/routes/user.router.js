const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();
const upload = require("../middlewares/upload");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { isProfileOwner } = require("../middlewares/authorizeMiddleware");

userRouter.get("/allUsers", isLoggedIn, userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get(
  "/getUserProfile/:id",
  isLoggedIn,
  userController.getUserProfile
);
userRouter.put(
  "/updateUserProfile/:id",
  isLoggedIn,
  isProfileOwner,
  upload.single("avatar"),
  userController.updateUserProfile
);
userRouter.delete(
  "/deleteUserProfile/:id",
  isLoggedIn,
  isProfileOwner,
  userController.deleteUserProfile
);

userRouter.get("/searchUser/:username", isLoggedIn, userController.userSearch);

userRouter.post(
  "/toggleFollow/:visitedUserId",
  isLoggedIn,
  userController.toggleFollow
);

userRouter.get("/feed/:id", isLoggedIn, userController.getFeedForDashboard);

module.exports = userRouter;
