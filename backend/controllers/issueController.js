const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");

const createIssue = async (req, res) => {
  const { title, description, repository } = req.body;

  try {
    const issue = new Issue({
      title,
      description,
      repository,
    });
    await issue.save();

    // Update repository: Push the issue's ObjectId to repo's issues array
    await Repository.findByIdAndUpdate(repository, {
      $push: { issues: issue._id },
    });
    res.status(201).json(issue);
  } catch (err) {
    console.error("❌ Error during creating the issue", err);
    res.status(500).send("Server Error");
  }
};

const UpdateIssueById = async (req, res) => {
  const { title, description, status } = req.body;
  const { id } = req.params; // issue id

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();
    res.status(201).json(issue, { message: "Issue Updated" });
  } catch (err) {
    console.error("❌ Error during updating the issue", err);
    res.status(500).send("Server Error");
  }
};

const deleteIssueById = async (req, res) => {
  const { id } = req.params; // issue id

  try {
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json({ message: "Issue Deleted" });
  } catch (err) {
    console.error("❌ Error during deleting the issue", err);
    res.status(500).send("Server Error");
  }
};

const getAllIssues = async (req, res) => {
  const { repoId } = req.params; // repo id
  if (!repoId || repoId === "undefined") {
    res.status(200).json([]); // return empty array, avoid error
    return;
  }
  try {
    const issue = await Issue.find({ repository: repoId });

    if (!issue) {
      res.status(201).json(issue, { message: "Issue not found" });
    }

    res.status(200).json(issue);
  } catch (err) {
    console.error("❌ Error during fetching all issues", err);
    res.status(500).send("Server Error");
  }
};

const getIssueById = async (req, res) => {
  const { id } = req.params; // issue id

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.status(200).json(issue);
  } catch (err) {
    console.error("❌ Error during fetching the issue", err);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createIssue,
  UpdateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
