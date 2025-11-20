const express = require("express");
const repoController = require("../controllers/repoController");
const repoRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");

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
  repoController.addStarRepository
);
repoRouter.delete(
  "/repo/:repoId/star",
  isLoggedIn,
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
  repoController.updateRepositoryById
);
repoRouter.patch(
  "/repo/toggle/:id",
  isLoggedIn,
  repoController.toggleVisibilityById
);
repoRouter.delete(
  "/repo/delete/:id",
  isLoggedIn,
  repoController.deleteRepositoryById
);

repoRouter.get("/repo/getFiles/:id", isLoggedIn, repoController.fetchRepoFiles);

module.exports = repoRouter;
