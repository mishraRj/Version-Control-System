const express = require("express");
const repoController = require("../controllers/repoController");
const repoRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { isRepoOwner } = require("../middlewares/authorizeMiddleware");

repoRouter.post("/repo/create", isLoggedIn, repoController.createRepository);
repoRouter.get("/repo/all", isLoggedIn, repoController.getAllRepositories);
repoRouter.get("/repo/:id", isLoggedIn, repoController.fetchRepositoryById);
repoRouter.get(
  "/repo/name/:name",
  isLoggedIn,
  repoController.fetchRepositoryByName
);
repoRouter.get(
  "/repo/user/:userId",
  isLoggedIn,
  repoController.fetchRepositoryForCurrentUser
);

repoRouter.post(
  "/repo/:repoId/star",
  isLoggedIn,
  isRepoOwner,
  repoController.addStarRepository
);
repoRouter.delete(
  "/repo/:repoId/star",
  isLoggedIn,
  isRepoOwner,
  repoController.removeStarRepository
);
repoRouter.get(
  "/repo/starred/:userId",
  isLoggedIn,
  repoController.fetchStarredRepositories
);
repoRouter.put(
  "/repo/update/:id",
  isLoggedIn,
  isRepoOwner,
  repoController.updateRepositoryById
);
repoRouter.patch(
  "/repo/toggle/:id",
  isLoggedIn,
  isRepoOwner,
  repoController.toggleVisibilityById
);
repoRouter.delete(
  "/repo/delete/:id",
  isLoggedIn,
  isRepoOwner,
  repoController.deleteRepositoryById
);

repoRouter.get("/repo/getFiles/:id", isLoggedIn, repoController.fetchRepoFiles);

module.exports = repoRouter;
