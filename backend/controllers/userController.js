const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
let ObjectId = require("mongodb").ObjectId;
const dotenv = require("dotenv");
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
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const usersCollection = db.collection("users");

    const query = { _id: new ObjectId(currentId) };

    let updatedFields = {};
    if (email !== undefined) updatedFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedFields.password = hashedPassword;
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const result = await usersCollection.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { returnOriginal: false } // old driver style
    );

    if (!result) {
      return res.status(404).json({ message: "User not found after update" });
    }

    res.json(result); // no `.value` needed for old driver
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

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
