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
  bio: {
    type: String,
    default: "Add bio here...",
  },
  avatar: {
    type: String,
    default:
      "https://raw.githubusercontent.com/mishraRj/Version-Control-System/1efb995ac8e2c352ef0bd1003e4ad0dd20949003/backend/avatars/defaultAvatar.jpg",
  },
  avatarPublicId: {
    type: String,
    default: null,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
