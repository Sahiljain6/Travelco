"use strict";

const AsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const USER_PUBLIC_FIELDS = "name pic email";

const accessChat = AsyncHandler(async (req, res) => {
  const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
  if (!/^[a-f0-9]{24}$/i.test(userId)) {
    return res.status(400).json({ message: "A valid chat participant is required." });
  }
  if (String(req.user._id) === userId) {
    return res.status(400).json({ message: "You cannot start a direct chat with yourself." });
  }

  const participant = await User.findById(userId).select("_id");
  if (!participant) return res.status(404).json({ message: "Chat participant not found." });

  const existingChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, participant._id], $size: 2 },
  })
    .populate("users", USER_PUBLIC_FIELDS)
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name pic" },
    });

  if (existingChat) return res.status(200).json(existingChat);

  try {
    const createdChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, participant._id],
    });
    const fullChat = await Chat.findById(createdChat._id)
      .populate("users", USER_PUBLIC_FIELDS)
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name pic" },
      });
    return res.status(201).json(fullChat);
  } catch (_error) {
    return res.status(500).json({ message: "Unable to open chat right now." });
  }
});

const fetchChats = AsyncHandler(async (req, res) => {
  const result = await Chat.find({ users: req.user._id })
    .populate("users", USER_PUBLIC_FIELDS)
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name pic" },
    })
    .sort({ updatedAt: -1 })
    .limit(200)
    .exec();

  return res.status(200).json(result);
});

module.exports = { accessChat, fetchChats };
