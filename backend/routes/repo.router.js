const express = require("express");
const repoController = require("../controllers/repoController");
const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get(
  "/repo/user/:userId",
  repoController.fetchRepositoryForCurrentUser
);
repoRouter.post("/repo/:repoId/star", repoController.addStarRepository);
repoRouter.delete("/repo/:repoId/star", repoController.removeStarRepository);
repoRouter.get(
  "/repo/starred/:userId",
  repoController.fetchStarredRepositories
);
repoRouter.put("/repo/update/:id", repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepositoryById);

repoRouter.get("/repo/getFiles/:id", repoController.fetchRepoFiles);

module.exports = repoRouter;
