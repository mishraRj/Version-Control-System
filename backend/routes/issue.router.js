const express = require("express");
const issueController = require("../controllers/issueController");
const issueRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { isIssueOwner } = require("../middlewares/authorizeMiddleware");

issueRouter.post("/issue/create/:id", isLoggedIn, issueController.createIssue);
issueRouter.put(
  "/issue/update/:id",
  isLoggedIn,
  isIssueOwner,
  issueController.UpdateIssueById
);
issueRouter.delete(
  "/issue/delete/:id",
  isLoggedIn,
  isIssueOwner,
  issueController.deleteIssueById
);
issueRouter.get("/issue/all/:repoId", isLoggedIn, issueController.getAllIssues);
issueRouter.get("/issue/:id", isLoggedIn, issueController.getIssueById);

module.exports = issueRouter;
