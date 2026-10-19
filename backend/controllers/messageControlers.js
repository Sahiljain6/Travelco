"use strict";

const AsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

const CHAT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const MAX_MESSAGE_LENGTH = 4000;
const MESSAGE_HISTORY_LIMIT = 500;

const sendMessage = AsyncHandler(async (req, res) => {
  const chatId = typeof req.body?.chatId === "string" ? req.body.chatId.trim() : "";
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!CHAT_ID_PATTERN.test(chatId)) {
    return res.status(400).json({ message: "A valid chat is required." });
  }
  if (!content || content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ message: "Message must contain 1–4000 characters." });
  }

  // A valid login is not sufficient: the sender must belong to this chat.
  const chat = await Chat.findOne({ _id: chatId, users: req.user._id }).select("_id users");
  if (!chat) return res.status(404).json({ message: "Chat not found." });

  try {
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chat._id,
    });
    message = await message.populate("sender", "name pic");
    message = await message.populate({
      path: "chat",
      select: "chatName isGroupChat users latestMessage",
      populate: { path: "users", select: "name pic email" },
    });

    await Chat.updateOne(
      { _id: chat._id, users: req.user._id },
      { $set: { latestMessage: message._id } }
    );
    return res.status(201).json(message);
  } catch (_error) {
    return res.status(500).json({ message: "Unable to send message right now." });
  }
});

const allMessages = AsyncHandler(async (req, res) => {
  const chatId = typeof req.params.chatId === "string" ? req.params.chatId : "";
  if (!CHAT_ID_PATTERN.test(chatId)) {
    return res.status(400).json({ message: "A valid chat is required." });
  }

  // Check membership before reading or populating any message documents.
  const chat = await Chat.findOne({ _id: chatId, users: req.user._id }).select("_id");
  if (!chat) return res.status(404).json({ message: "Chat not found." });

  const messages = await Message.find({ chat: chat._id })
    .sort({ createdAt: -1 })
    .limit(MESSAGE_HISTORY_LIMIT)
    .populate("sender", "name pic")
    .populate({
      path: "chat",
      select: "chatName isGroupChat users",
      populate: { path: "users", select: "name pic email" },
    });
  return res.status(200).json(messages.reverse());
});

module.exports = { sendMessage, allMessages };
