const express = require("express");
const issueController = require("../controllers/issueController");
const issueRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");

issueRouter.post("/issue/create/:id", isLoggedIn, issueController.createIssue);
issueRouter.put(
  "/issue/update/:id",
  isLoggedIn,
  issueController.UpdateIssueById
);
issueRouter.delete(
  "/issue/delete/:id",
  isLoggedIn,
  issueController.deleteIssueById
);
issueRouter.get("/issue/all/:repoId", isLoggedIn, issueController.getAllIssues);
issueRouter.get("/issue/:id", isLoggedIn, issueController.getIssueById);

module.exports = issueRouter;
