const express = require("express");
const issueController = require("../controllers/issueController");
const issueRouter = express.Router();
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { isIssueOwner } = require("../middlewares/authorizeMiddleware");
const wrapAsync = require("../utils/wrapAsync");

issueRouter.post(
  "/issue/create/:id",
  isLoggedIn,
  wrapAsync(issueController.createIssue)
);
issueRouter.put(
  "/issue/update/:id",
  isLoggedIn,
  isIssueOwner,
  wrapAsync(issueController.UpdateIssueById)
);
issueRouter.delete(
  "/issue/delete/:id",
  isLoggedIn,
  isIssueOwner,
  wrapAsync(issueController.deleteIssueById)
);
issueRouter.get(
  "/issue/all/:repoId",
  isLoggedIn,
  wrapAsync(issueController.getAllIssues)
);
issueRouter.get(
  "/issue/:id",
  isLoggedIn,
  wrapAsync(issueController.getIssueById)
);

module.exports = issueRouter;
