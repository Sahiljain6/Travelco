const express = require("express");
const {
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
} = require("../controllers/contactMessageController");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", submitContactMessage);
router.get("/", adminMiddleware, getContactMessages);
router.patch("/:id", adminMiddleware, updateContactMessage);
router.delete("/:id", adminMiddleware, deleteContactMessage);

module.exports = router;
