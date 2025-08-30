const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");

const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid UserID" });
    }

    // 1. Create repo
    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    // 2. Link repo to user
    await User.findByIdAndUpdate(
      owner,
      { $push: { repositories: result._id } },
      { new: true }
    );

    // 3. Send response
    res.status(201).json({
      message: "Repository Created",
      repositoryId: result._id,
    });
  } catch (err) {
    console.error("❌ Error during repository creation", err);
    res.status(500).send("Server Error");
  }
};

const getAllRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("❌ Error during fetching repositories", err);
    res.status(500).send("Server Error");
  }
};

const fetchRepositoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const repository = await Repository.find({ _id: id })
      .populate("owner")
      .populate("issues");
    if (!repository) {
      return res.status(400).json({ message: "repository not found!" });
    }
    res.json(repository);
  } catch (err) {
    console.error("❌ Error during fetching repositories", err);
    res.status(500).send("Server Error");
  }
};

const fetchRepositoryByName = async (req, res) => {
  const { name } = req.params;
  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");
    if (!repository) {
      return res.status(400).json({ message: "repository not found!" });
    }
    res.json(repository);
  } catch (err) {
    console.error("❌ Error during fetching repositories", err);
    res.status(500).send("Server Error");
  }
};

async function fetchRepositoryForCurrentUser(req, res) {
  const userID = req.params.userId; // ✅ use correct param key

  try {
    const repositories = await Repository.find({
      owner: new mongoose.Types.ObjectId(userID), // ✅ convert to ObjectId
    });

    res.json({
      message: "Repositories fetched successfully",
      repositories: repositories || [],
    });
  } catch (err) {
    console.error("❌ Error during fetching user repositories:", err.message);
    res.status(500).send("Server error");
  }
}

const updateRepositoryById = async (req, res) => {
  const { id } = req.params;
  const { content, description } = request.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    repository.content.push(content);
    repository.description = description;

    const updatedRepository = await repository.save();
    res.json({
      message: "repository updated successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("❌ Error during updating repository", err);
    res.status(500).send("Server Error");
  }
};

const toggleVisibilityById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();
    res.json({
      message: "repository visibility toggled successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("❌ Error during toggling visibility of repository", err);
    res.status(500).send("Server Error");
  }
};

const deleteRepositoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    res.json({
      message: "repository deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error during deleting the repository", err);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};
