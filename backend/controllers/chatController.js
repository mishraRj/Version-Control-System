const ChatMessage = require("../models/chatMessageModel");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/userModel");
const { getIO } = require("../socket");

const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user.id; // from auth middleware

  if (!receiverId || !message) {
    throw new ExpressError(400, "Receiver and message are required");
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ExpressError(404, "Receiver not found");
  }

  const newMessage = new ChatMessage({
    sender: senderId,
    receiver: receiverId,
    message,
    read: false,
  });

  await newMessage.save();

  // Populate sender for response
  await newMessage.populate("sender", "username avatar");

  // Emit to receiver's room for real-time
  const io = getIO();
  io.to(receiverId).emit("newMessage", newMessage);

  res.status(201).json({
    success: true,
    message: newMessage,
  });
};

const getChatHistory = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user?.id?.toString
    ? req.user.id.toString()
    : String(req.user.id);
  const { Types } = require("mongoose");

  if (!Types.ObjectId.isValid(otherUserId)) {
    throw new ExpressError(400, "Invalid user id");
  }

  const messages = await ChatMessage.find({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ],
  })
    .populate("sender", "username avatar")
    .populate("receiver", "username avatar")
    .sort({ timestamp: 1 });

  // Mark as read all messages from other user to current user
  await ChatMessage.updateMany(
    { sender: otherUserId, receiver: userId, read: false },
    { read: true },
  );

  res.json({
    success: true,
    messages,
  });
};

const getChatList = async (req, res) => {
  const userId = req.user?.id?.toString
    ? req.user.id.toString()
    : String(req.user.id);
  const { Types } = require("mongoose");
  const userObjectId = new Types.ObjectId(userId);

  const conversations = await ChatMessage.aggregate([
    {
      $match: {
        $or: [{ sender: userObjectId }, { receiver: userObjectId }],
      },
    },
    {
      $sort: { timestamp: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", userObjectId] },
            "$receiver",
            "$sender",
          ],
        },
        lastMessage: { $first: "$message" },
        lastMessageTime: { $first: "$timestamp" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", userObjectId] },
                  { $eq: ["$read", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "participant",
      },
    },
    {
      $unwind: "$participant",
    },
    {
      $project: {
        _id: 0,
        userId: { $toString: "$_id" },
        username: "$participant.username",
        avatar: "$participant.avatar",
        lastMessage: 1,
        lastMessageTime: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { lastMessageTime: -1 },
    },
  ]);
  res.json({ success: true, conversations });
};

const markMessagesRead = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;

  await ChatMessage.updateMany(
    { sender: otherUserId, receiver: userId, read: false },
    { read: true },
  );

  res.json({ success: true });
};

const deleteChat = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;

  // Delete all messages between the two users
  await ChatMessage.deleteMany({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ],
  });

  res.json({
    success: true,
    message: "Chat deleted successfully",
  });
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatList,
  markMessagesRead,
  deleteChat,
};
