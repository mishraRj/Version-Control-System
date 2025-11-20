const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();
const upload = require("../middlewares/upload");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { isProfileOwner } = require("../middlewares/authorizeMiddleware");
const wrapAsync = require("../utils/wrapAsync");

userRouter.get("/allUsers", isLoggedIn, wrapAsync(userController.getAllUsers));
userRouter.post("/signup", wrapAsync(userController.signup));
userRouter.post("/login", wrapAsync(userController.login));
userRouter.get(
  "/getUserProfile/:id",
  isLoggedIn,
  wrapAsync(userController.getUserProfile)
);
userRouter.put(
  "/updateUserProfile/:id",
  isLoggedIn,
  isProfileOwner,
  upload.single("avatar"),
  wrapAsync(userController.updateUserProfile)
);
userRouter.delete(
  "/deleteUserProfile/:id",
  isLoggedIn,
  isProfileOwner,
  wrapAsync(userController.deleteUserProfile)
);
userRouter.get(
  "/searchUser/:username",
  isLoggedIn,
  wrapAsync(userController.userSearch)
);
userRouter.post(
  "/toggleFollow/:visitedUserId",
  isLoggedIn,
  wrapAsync(userController.toggleFollow)
);
userRouter.get(
  "/feed/:id",
  isLoggedIn,
  wrapAsync(userController.getFeedForDashboard)
);

module.exports = userRouter;
