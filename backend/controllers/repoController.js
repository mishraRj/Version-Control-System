const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Commit = require("../models/commit");
const Activity = require("../models/activityModel");
const ExpressError = require("../utils/ExpressError");

const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;
  if (!name) {
    throw new ExpressError(400, "Repository name is required!");
  }

  if (!mongoose.Types.ObjectId.isValid(owner)) {
    throw new ExpressError(400, "Invalid UserID");
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

  // 3. Log Activity
  await Activity.create({
    user: owner,
    type: "repo",
    target: result._id,
    description: `created repository "${name}"`,
    timestamp: new Date(),
  });

  // 4. Send response
  res.status(201).json({
    message: "Repository Created",
    repositoryId: result._id,
  });
};

const getAllRepositories = async (req, res) => {
  const repositories = await Repository.find({})
    .populate("owner")
    .populate("issues");

  res.json(repositories);
};

const fetchRepositoryById = async (req, res) => {
  const { id } = req.params;
  const repository = await Repository.findById(id)
    .populate("owner")
    .populate("issues");

  if (!repository) {
    throw new ExpressError(404, "Repository not found!");
  }

  res.json(repository);
};

const fetchRepositoryByName = async (req, res) => {
  const { name } = req.params;
  const repository = await Repository.find({ name })
    .populate("owner")
    .populate("issues");

  if (!repository || repository.length === 0) {
    throw new ExpressError(404, "Repository not found!");
  }
  res.json(repository);
};

const fetchRepositoryForCurrentUser = async (req, res) => {
  const userID = req.params.userId;
  const repositories = await Repository.find({
    owner: new mongoose.Types.ObjectId(userID),
  }).populate("owner", "avatar username");

  res.json({
    message: "Repositories fetched successfully",
    repositories: repositories || [],
  });
};

// Fetch starred repos for current user
const fetchStarredRepositories = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate("starRepos");
  if (!user) {
    throw new ExpressError(404, "User not found");
  }

  res.json({
    repositories: user.starRepos || [],
    starRepos: user.starRepos.map(r => r._id.toString()),
  });
};

// Add star
const addStarRepository = async (req, res) => {
  const { repoId } = req.params;
  const { userId } = req.body;

  if (!userId) throw new ExpressError(400, "User ID is required");

  const user = await User.findById(userId);
  if (!user) throw new ExpressError(404, "User not found");

  const repoObjectId = new mongoose.Types.ObjectId(repoId);
  if (user.starRepos.some(r => r.toString() === repoId)) {
    throw new ExpressError(400, "Repo already starred");
  }

  user.starRepos.push(repoObjectId);
  await user.save();

  res.json({
    message: "Repository starred successfully",
    starRepos: user.starRepos.map(r => r.toString()),
  });
};

// Remove star
const removeStarRepository = async (req, res) => {
  const { repoId } = req.params;
  const { userId } = req.body;

  if (!userId) throw new ExpressError(400, "User ID is required");

  const user = await User.findById(userId);
  if (!user) throw new ExpressError(404, "User not found");

  user.starRepos = user.starRepos.filter(
    r => r && r.toString() !== repoId.toString()
  );
  await user.save();

  res.json({
    message: "Repository unstarred successfully",
    starRepos: user.starRepos.map(r => r.toString()) || [],
  });
};

const updateRepositoryById = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const updatedRepo = await Repository.findByIdAndUpdate(
    id,
    { name, description },
    { new: true, runValidators: true }
  );

  if (!updatedRepo) {
    throw new ExpressError(404, "Repository not found");
  }

  res.json({
    message: "Repository updated successfully",
    repository: updatedRepo,
  });
};

const toggleVisibilityById = async (req, res) => {
  const { id } = req.params;

  const repository = await Repository.findById(id);
  if (!repository) {
    throw new ExpressError(404, "Repository not found");
  }

  repository.visibility =
    repository.visibility === "public" ? "private" : "public";
  const updatedRepository = await repository.save();

  res.json({
    message: "Repository visibility toggled successfully",
    repository: updatedRepository,
  });
};

const deleteRepositoryById = async (req, res) => {
  const { id } = req.params;

  await Commit.deleteMany({ repository: id });

  const repository = await Repository.findByIdAndDelete(id);
  if (!repository) {
    throw new ExpressError(404, "Repository not found");
  }

  res.json({
    message: "Repository and related commits deleted successfully",
  });
};

const fetchRepoFiles = async (req, res) => {
  const { id } = req.params; // repoId

  const commits = await Commit.find({ repository: id }).sort({ date: -1 });

  res.status(200).json(commits);
};

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  fetchStarredRepositories,
  removeStarRepository,
  addStarRepository,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  fetchRepoFiles,
};
