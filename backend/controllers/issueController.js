const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const Activity = require("../models/activityModel");
const ExpressError = require("../utils/ExpressError");

const createIssue = async (req, res) => {
  const { title, description, repository } = req.body;
  const { id } = req.params; // user id

  const issue = new Issue({
    title,
    description,
    repository,
  });
  await issue.save();

  await Repository.findByIdAndUpdate(repository, {
    $push: { issues: issue._id },
  });

  await Activity.create({
    user: id,
    type: "issue",
    target: issue._id,
    description: `opened issue "${issue.title}"`,
    timestamp: new Date(),
  });

  res.status(201).json(issue);
};

const UpdateIssueById = async (req, res) => {
  const { title, description, status } = req.body;
  const { id } = req.params; // issue id

  const issue = await Issue.findById(id);
  if (!issue) {
    throw new ExpressError(404, "Issue not found");
  }

  issue.title = title;
  issue.description = description;
  issue.status = status;
  await issue.save();
  res.status(200).json({ message: "Issue Updated", issue });
};

const deleteIssueById = async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findByIdAndDelete(id);
  if (!issue) {
    throw new ExpressError(404, "Issue not found");
  }

  res.json({ message: "Issue Deleted" });
};

const getAllIssues = async (req, res) => {
  const { repoId } = req.params;
  if (!repoId || repoId === "undefined") {
    return res.status(200).json([]);
  }
  const issues = await Issue.find({ repository: repoId });
  res.status(200).json(issues);
};

const getIssueById = async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    throw new ExpressError(404, "Issue not found");
  }

  res.status(200).json(issue);
};

module.exports = {
  createIssue,
  UpdateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
