const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const dotenv = require("dotenv");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");

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
  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User Already Exists!" });
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
      { expiresIn: "1h" }
    );
    res.json({ token, userId: result.insertedId });
  } catch (err) {
    console.log("Error during signing up!", err);
    res.status(500).send("Server Error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("❌ Error during logging in:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.log("Error during signing up!", err);
    res.status(500).send("Server Error");
  }
};

const getUserProfile = async (req, res) => {
  const currentId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentId),
    });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }
    res.send(user);
  } catch (err) {
    console.log("Error during signing up!", err);
    res.status(500).send("Server Error");
  }
};

const updateUserProfile = async (req, res) => {
  const currentId = req.params.id;
  const { username, bio, skills, about1, about2, about3, caption } = req.body;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const query = { _id: new ObjectId(currentId) };
    let updatedFields = {};

    // ----------------------------
    // TEXT FIELDS UPDATE
    // ----------------------------
    if (username !== undefined) updatedFields.username = username;
    if (bio !== undefined) updatedFields.bio = bio;
    if (skills !== undefined) updatedFields.skills = skills;
    if (about1 !== undefined) updatedFields.about1 = about1;
    if (about2 !== undefined) updatedFields.about2 = about2;
    if (about3 !== undefined) updatedFields.about3 = about3;
    if (caption !== undefined) updatedFields.caption = caption;

    // ----------------------------
    // AVATAR UPLOAD
    // ----------------------------
    if (req.file) {
      // Find existing user
      const existingUser = await usersCollection.findOne(query);

      // Delete old avatar if exists and is not default
      if (
        existingUser?.avatarPublicId &&
        !existingUser.avatar.includes("defaultAvatar.jpg")
      ) {
        try {
          await cloudinary.uploader.destroy(existingUser.avatarPublicId);
          console.log("🗑️ Old avatar deleted:", existingUser.avatarPublicId);
        } catch (err) {
          console.warn("⚠️ Failed to delete old avatar:", err);
        }
      }

      // Validate image type
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Avatar must be an image." });
      }

      // Upload new avatar to Cloudinary
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
      console.log("☁️ Cloudinary uploaded:", uploadResult.secure_url);
    }

    // ----------------------------
    // CHECK IF ANY FIELD TO UPDATE
    // ----------------------------
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // ----------------------------
    // UPDATE USER
    // ----------------------------
    const result = await usersCollection.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { returnDocument: "after" }
    );

    const updatedUser = result?.value || result;
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Error during profile update:", err);
    res.status(500).send("Server Error");
  }
};

const deleteUserProfile = async (req, res) => {
  const currentId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentId),
    });
    if (!result.deleteCount == 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "User Deleted" });
  } catch (err) {
    console.log("Error during signing up!", err);
    res.status(500).send("Server Error");
  }
};

const userSearch = async (req, res) => {
  const username = req.params.username; // param se lo

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    // Case-insensitive, partial match using regex
    const users = await usersCollection
      .find({ username: { $regex: username, $options: "i" } })
      .project({ password: 0 }) // don't return password!
      .toArray();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }

    res.send({ users });
  } catch (err) {
    console.error("Error while searching users:", err);
    res.status(500).send("Server Error");
  }
};

const toggleFollow = async (req, res) => {
  const visitedUserId = req.params.visitedUserId;
  const { loggedInUserId } = req.body; // comes from POST body

  if (!visitedUserId || !loggedInUserId) {
    return res.status(400).json({ message: "Both user IDs are required." });
  }

  try {
    // Find both users
    const visitedUser = await User.findById(visitedUserId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!visitedUser || !loggedInUser) {
      return res.status(404).json({ message: "User(s) not found." });
    }

    // Check if already followed
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

    // Save both
    await loggedInUser.save();
    await visitedUser.save();

    res.json({
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
      isFollowing: !isFollowing,
    });
  } catch (error) {
    console.error("toggleFollow error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFeedForDashboard = async (req, res) => {
  try {
    const { id } = req.params; // logged-in user's id

    // Fetching user’s following list
    const user = await User.findById(id);
    const following = user.followedUsers || []; // array of ObjectIds

    // Activity: user + followed users ka filter
    const feed = await Activity.find({
      user: { $in: [id, ...following] },
    })
      .sort({ timestamp: -1 })
      .limit(25) // recent 25 actions, change as needed
      .populate("user", "username avatar"); // populate only needed fields

    res.status(200).json(feed);
  } catch (err) {
    console.error("Error fetching feed", err);
    res.status(500).send("Server Error");
  }
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
