const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default:
      "https://raw.githubusercontent.com/mishraRj/Version-Control-System/563bceaed8d9372299f5cf31904a64d6108ab1be/backend/avatars/defaultAvatar.jpg",
  },
  skills: {
    type: String,
    default: "HTML, CSS, JS ... ... ",
  },
  about1: {
    type: String,
    default: "Building: xyz Technology",
  },
  about2: {
    type: String,
    default: "Working on me every day",
  },
  about3: {
    type: String,
    default: "Hire me: example@gmail.com",
  },
  caption: {
    type: String,
    default: "Give a small caption ...",
  },
  repositories: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
  followers: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followedUsers: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  starRepos: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
