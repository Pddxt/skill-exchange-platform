import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";

// @desc    Send a message to another user
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content, relatedSkill } = req.body;

  if (!recipientId || !content) {
    res.status(400);
    throw new Error("recipientId and content are required");
  }
  if (recipientId === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot message yourself");
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    relatedSkill: relatedSkill || undefined,
  });

  res.status(201).json(message);
});

// @desc    Get list of conversations (most recent message per contact)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .sort("-createdAt")
    .populate("sender", "name avatar")
    .populate("recipient", "name avatar");

  const conversationsMap = new Map();
  for (const msg of messages) {
    const otherUser =
      msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender;
    const key = otherUser._id.toString();
    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, { user: otherUser, lastMessage: msg });
    }
  }

  res.json(Array.from(conversationsMap.values()));
});

// @desc    Get full conversation thread with one user
// @route   GET /api/messages/:userId
// @access  Private
export const getThread = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  }).sort("createdAt");

  await Message.updateMany(
    { sender: otherUserId, recipient: userId, isRead: false },
    { isRead: true }
  );

  res.json(messages);
});
