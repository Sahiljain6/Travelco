const User = require("../models/userModel");

const safeUserSelect = "-password -emailVerificationTokenHash -passwordResetTokenHash";

const updateUser = async (req, res) => {
  try {
    const allowedFields = ["name", "country", "mobile", "img", "pic"];
    const update = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) update[field] = req.body[field];
    });

    if (update.name !== undefined) {
      if (typeof update.name !== "string" || update.name.trim().length < 2 || update.name.trim().length > 80) {
        return res.status(400).json({ message: "Name must be between 2 and 80 characters" });
      }
      update.name = update.name.trim();
    }
    if (update.country !== undefined) {
      if (typeof update.country !== "string" || !update.country.trim() || update.country.trim().length > 80) {
        return res.status(400).json({ message: "Please select a valid country" });
      }
      update.country = update.country.trim();
    }
    if (update.mobile !== undefined) {
      if (typeof update.mobile !== "string" || update.mobile.trim().length < 7 || update.mobile.trim().length > 25) {
        return res.status(400).json({ message: "Please enter a valid phone number" });
      }
      update.mobile = update.mobile.trim();
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select(safeUserSelect);
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(safeUserSelect);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(safeUserSelect);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { updateUser, deleteUser, getUser, getAllUsers };
