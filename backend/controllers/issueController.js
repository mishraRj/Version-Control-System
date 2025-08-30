const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");

const createIssue = async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params; // repo id

  try {
    const issue = new Issue({
      title,
      description,
      repository: id,
    });

    await issue.save();
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
  const { id } = req.params; // repo id

  try {
    const issue = await Issue.find({ repository: id });

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
