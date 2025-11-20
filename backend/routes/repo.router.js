const express = require("express");
const repoController = require("../controllers/repoController");
const repoRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { isRepoOwner } = require("../middlewares/authorizeMiddleware");
const wrapAsync = require("../utils/wrapAsync");

repoRouter.post(
  "/repo/create",
  isLoggedIn,
  wrapAsync(repoController.createRepository)
);
repoRouter.get(
  "/repo/all",
  isLoggedIn,
  wrapAsync(repoController.getAllRepositories)
);
repoRouter.get(
  "/repo/:id",
  isLoggedIn,
  wrapAsync(repoController.fetchRepositoryById)
);
repoRouter.get(
  "/repo/name/:name",
  isLoggedIn,
  wrapAsync(repoController.fetchRepositoryByName)
);
repoRouter.get(
  "/repo/user/:userId",
  isLoggedIn,
  wrapAsync(repoController.fetchRepositoryForCurrentUser)
);
repoRouter.post(
  "/repo/:repoId/star",
  isLoggedIn,
  isRepoOwner,
  wrapAsync(repoController.addStarRepository)
);
repoRouter.delete(
  "/repo/:repoId/star",
  isLoggedIn,
  isRepoOwner,
  wrapAsync(repoController.removeStarRepository)
);
repoRouter.get(
  "/repo/starred/:userId",
  isLoggedIn,
  wrapAsync(repoController.fetchStarredRepositories)
);
repoRouter.put(
  "/repo/update/:id",
  isLoggedIn,
  isRepoOwner,
  wrapAsync(repoController.updateRepositoryById)
);
repoRouter.patch(
  "/repo/toggle/:id",
  isLoggedIn,
  isRepoOwner,
  wrapAsync(repoController.toggleVisibilityById)
);
repoRouter.delete(
  "/repo/delete/:id",
  isLoggedIn,
  isRepoOwner,
  wrapAsync(repoController.deleteRepositoryById)
);
repoRouter.get(
  "/repo/getFiles/:id",
  isLoggedIn,
  wrapAsync(repoController.fetchRepoFiles)
);

module.exports = repoRouter;
