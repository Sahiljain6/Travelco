const express = require("express");
const {
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
} = require("../controllers/contactMessageController");
const { adminMiddleware } = require("../middleware/authMiddleware");
const { contactMessageLimit } = require("../middleware/routeLimits");

const router = express.Router();

router.post("/", contactMessageLimit, submitContactMessage);
router.get("/", adminMiddleware, getContactMessages);
router.patch("/:id", adminMiddleware, updateContactMessage);
router.delete("/:id", adminMiddleware, deleteContactMessage);

module.exports = router;
