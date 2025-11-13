const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();
const upload = require("../middlewares/upload");

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/getUserProfile/:id", userController.getUserProfile);
userRouter.put(
  "/updateUserProfile/:id",
  upload.single("avatar"),
  userController.updateUserProfile
);
userRouter.delete("/deleteUserProfile/:id", userController.deleteUserProfile);

userRouter.get("/searchUser/:username", userController.userSearch);

userRouter.post("/toggleFollow/:visitedUserId", userController.toggleFollow);

userRouter.get("/feed/:id", userController.getFeedForDashboard);

module.exports = userRouter;
