const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const ExpressError = require("../utils/ExpressError");

dotenv.config();

const MongoURL = process.env.MONGO_URL;
let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(MongoURL);
    await client.connect();
  }
}

const signup = async (req, res) => {
  const { username, password, email } = req.body;
  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ username });
  if (user) {
    throw new ExpressError(400, "User Already Exists!");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    username,
    password: hashedPassword,
    bio: "Add bio here...",
    email,
    avatar:
      "https://raw.githubusercontent.com/mishraRj/Version-Control-System/1efb995ac8e2c352ef0bd1003e4ad0dd20949003/backend/avatars/defaultAvatar.jpg",
    skills: "HTML, CSS, JS ... ... ",
    about1: "Building: xyz Technology",
    about2: "Working on me every day",
    about3: "Hire me: example@gmail.com",
    caption: "Give a small caption ...",
    repositories: [],
    followedUsers: [],
    starRepos: [],
  };
  const result = await usersCollection.insertOne(newUser);
  const token = jwt.sign(
    { id: result.insertedId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "2d" }
  );
  res.json({ token, userId: result.insertedId });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new ExpressError(400, "Invalid Credentials!");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ExpressError(400, "Invalid Credentials!");
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2d",
  });
  res.json({ token, userId: user._id });
};

const getAllUsers = async (req, res) => {
  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const users = await usersCollection.find({}).toArray();
  res.json(users);
};

const getUserProfile = async (req, res) => {
  const currentId = req.params.id;
  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({
    _id: new ObjectId(currentId),
  });
  if (!user) {
    throw new ExpressError(404, "User not found!");
  }
  res.send(user);
};

const updateUserProfile = async (req, res) => {
  const currentId = req.params.id;
  const { username, bio, skills, about1, about2, about3, caption } = req.body;

  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const query = { _id: new ObjectId(currentId) };
  let updatedFields = {};

  // Text fields
  if (username !== undefined) updatedFields.username = username;
  if (bio !== undefined) updatedFields.bio = bio;
  if (skills !== undefined) updatedFields.skills = skills;
  if (about1 !== undefined) updatedFields.about1 = about1;
  if (about2 !== undefined) updatedFields.about2 = about2;
  if (about3 !== undefined) updatedFields.about3 = about3;
  if (caption !== undefined) updatedFields.caption = caption;

  // Avatar upload
  if (req.file) {
    const existingUser = await usersCollection.findOne(query);

    if (
      existingUser?.avatarPublicId &&
      !existingUser.avatar.includes("defaultAvatar.jpg")
    ) {
      try {
        await cloudinary.uploader.destroy(existingUser.avatarPublicId);
      } catch (err) {
        console.log("error while updating", err);
      }
    }

    if (!req.file.mimetype.startsWith("image/")) {
      throw new ExpressError(400, "Avatar must be an image.");
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "githubClone/avatars",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    updatedFields.avatar = uploadResult.secure_url;
    if (uploadResult.public_id)
      updatedFields.avatarPublicId = uploadResult.public_id;
  }

  if (Object.keys(updatedFields).length === 0) {
    throw new ExpressError(400, "No fields provided to update");
  }

  const result = await usersCollection.findOneAndUpdate(
    query,
    { $set: updatedFields },
    { returnDocument: "after" }
  );

  const updatedUser = result?.value || result;
  if (!updatedUser) {
    throw new ExpressError(404, "User not found after update");
  }

  res.json(updatedUser);
};

const deleteUserProfile = async (req, res) => {
  const currentId = req.params.id;
  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const result = await usersCollection.deleteOne({
    _id: new ObjectId(currentId),
  });
  if (!result.deletedCount || result.deletedCount === 0) {
    throw new ExpressError(404, "User not found!");
  }

  res.json({ message: "User Deleted" });
};

const userSearch = async (req, res) => {
  const username = req.params.username;
  await connectClient();
  const db = client.db("githubClone");
  const usersCollection = db.collection("users");

  const users = await usersCollection
    .find({ username: { $regex: username, $options: "i" } })
    .project({ password: 0 })
    .toArray();

  if (!users || users.length === 0) {
    throw new ExpressError(404, "No users found!");
  }

  res.send({ users });
};

const toggleFollow = async (req, res) => {
  const visitedUserId = req.params.visitedUserId;
  const { loggedInUserId } = req.body;

  if (!visitedUserId || !loggedInUserId) {
    throw new ExpressError(400, "Both user IDs are required.");
  }

  const visitedUser = await User.findById(visitedUserId);
  const loggedInUser = await User.findById(loggedInUserId);

  if (!visitedUser || !loggedInUser) {
    throw new ExpressError(404, "User(s) not found.");
  }

  const isFollowing = loggedInUser.followedUsers.includes(visitedUserId);

  if (isFollowing) {
    // Unfollow
    loggedInUser.followedUsers.pull(visitedUserId);
    visitedUser.followers.pull(loggedInUserId);
  } else {
    // Follow
    loggedInUser.followedUsers.push(visitedUserId);
    visitedUser.followers.push(loggedInUserId);
  }

  await loggedInUser.save();
  await visitedUser.save();

  res.json({
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    isFollowing: !isFollowing,
  });
};

const getFeedForDashboard = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const following = user.followedUsers || [];
  const feed = await Activity.find({
    user: { $in: [id, ...following] },
  })
    .sort({ timestamp: -1 })
    .limit(25)
    .populate("user", "username avatar");

  res.status(200).json(feed);
};

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  userSearch,
  toggleFollow,
  getFeedForDashboard,
};
