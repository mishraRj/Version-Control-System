const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

// Only repo owner can proceed
module.exports.isRepoOwner = async (req, res, next) => {
  const repoId = req.params.id || req.params.repoId;
  const repo = await Repository.findById(repoId);
  if (!repo) {
    return res.status(404).json({ error: "Repo not found" });
  }
  if (repo.owner.toString() !== req.user.id) {
    return res.status(403).json({ error: "Not repo owner" });
  }
  next();
};

// Only profile owner can update profile
module.exports.isProfileOwner = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Not allowed on this user profile!" });
  }
  next();
};

// Only issue's repo owner can perform the action
module.exports.isIssueOwner = async (req, res, next) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }
  const repo = await Repository.findById(issue.repository);
  if (!repo || repo.owner.toString() !== req.user.id) {
    return res.status(403).json({ error: "Not repo owner for this issue!" });
  }
  next();
};
