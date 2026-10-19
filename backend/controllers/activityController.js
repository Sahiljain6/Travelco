const SpecialActivity = require('../models/SpecialActivityModel.js');
const { parsePagination } = require("../utils/pagination");
const { escapeRegex } = require("../utils/securityValidation");
const { isOwnerOrAdmin } = require("../utils/authorization");

const moment = require('moment');
const createActivity = async (req, res) => {
  const user = req.user;
  console.log(req.user);
  try {
    const {
      id, // Only available for editing an existing activity
      name,
      location,
      dateRange,
      timeRange,
      type,
      description,
      image,
    } = req.body;

    if (id) {
      // Editing an existing activity
      const existingActivity = await SpecialActivity.findById(id);

      if (!existingActivity) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      if (!isOwnerOrAdmin(existingActivity.user, req)) {
        return res.status(403).json({ error: 'You can only edit your own activity' });
      }

      existingActivity.name = name;
      existingActivity.location = location;
      existingActivity.dateRange = dateRange;
      existingActivity.timeRange = timeRange;
      existingActivity.type = type;
      existingActivity.description = description;
      existingActivity.image = image;

      const updatedActivity = await existingActivity.save();

      res.status(200).json({ updated: true, activity: updatedActivity });
    } else {
      // Creating a new activity
      const newActivity = new SpecialActivity({
        user: user,
        name,
        location,
        dateRange,
        timeRange,
        type,
        description,
        image,
      });

      const savedActivity = await newActivity.save();

      res.status(201).json({ created: true, activity: savedActivity });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveActivity = async (req, res) => {
  try {
    console.log(req.params);
    const activityId = req.params.id;
    const updatedActivity = await SpecialActivity.findByIdAndUpdate(
      activityId,
      { $set: { status: 'APPROVED' } },
      { new: true }
    );
    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getApprovedActivities = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) return res.status(400).json({ error: "Page must be 1–10000 and limit must be 1–100." });
  const { page, limit, skip } = pagination;
  try {
    const activities = await SpecialActivity.find({ status: 'APPROVED' })
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await SpecialActivity.countDocuments({ status: 'APPROVED' });

    res.status(200).json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyActivities = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) return res.status(400).json({ error: "Page must be 1–10000 and limit must be 1–100." });
  const { page, limit, skip } = pagination;
  const user = req.user;
  try {
    const activities = await SpecialActivity.find({ user: user })
      .sort({ createdAt: 1 }) // Preserve the existing order for compatibility.
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await SpecialActivity.countDocuments({ user: user });

    res.status(200).json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingActivities = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (!pagination) return res.status(400).json({ error: "Page must be 1–10000 and limit must be 1–100." });
  const { page, limit, skip } = pagination;
  try {
    const activities = await SpecialActivity.find({ status: "PENDING" })
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await SpecialActivity.countDocuments({ status: "PENDING" });

    res.status(200).json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const declineActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const updatedActivity = await SpecialActivity.findByIdAndUpdate(
      activityId,
      { $set: { status: 'DECLINED' } },
      { new: true }
    );
    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await SpecialActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    if (!isOwnerOrAdmin(activity.user, req)) {
      return res.status(403).json({ error: "You can only delete your own activity" });
    }
    await activity.deleteOne();
    return res.status(200).json({ success: true, activityId: String(activity._id) });
  } catch (_error) {
    return res.status(400).json({ error: "Unable to delete activity" });
  }
};

const filterActivities = async (req, res) => {
  const pagination = parsePagination(req.query, { maxLimit: 100 });
  if (!pagination) return res.status(400).json({ error: "Page must be 1–10000 and limit must be 1–100." });
  const { page, limit, skip } = pagination;
  const { name, type, startDate, endDate, startTime, endTime, searchQuery } = req.query;
  const filter = { status: "APPROVED" };

  // Treat search values as literal text, not caller-supplied regular expressions.
  const safeName = typeof name === "string" ? name.trim().slice(0, 80) : "";
  const safeSearch = typeof searchQuery === "string" ? searchQuery.trim().slice(0, 80) : "";
  if (safeName) filter.name = { $regex: escapeRegex(safeName), $options: "i" };
  if (typeof type === "string" && type.trim()) filter.type = type.trim().slice(0, 50);

  if (typeof startDate === "string" && typeof endDate === "string" &&
      startDate.length <= 40 && endDate.length <= 40) {
    const parsedStart = moment(startDate, moment.ISO_8601, true);
    const parsedEnd = moment(endDate, moment.ISO_8601, true);
    if (!parsedStart.isValid() || !parsedEnd.isValid() || parsedEnd.isBefore(parsedStart)) {
      return res.status(400).json({ error: "A valid activity date range is required." });
    }
    filter["dateRange.startDate"] = { $lte: parsedEnd.toDate() };
    filter["dateRange.endDate"] = { $gte: parsedStart.toDate() };
  }
  if (typeof startTime === "string" && typeof endTime === "string" &&
      startTime.length <= 20 && endTime.length <= 20) {
    filter["timeRange.startTime"] = { $lte: endTime };
    filter["timeRange.endTime"] = { $gte: startTime };
  }
  if (safeSearch) {
    const literalSearch = escapeRegex(safeSearch);
    filter.$or = [
      { name: { $regex: literalSearch, $options: "i" } },
      { description: { $regex: literalSearch, $options: "i" } },
    ];
  }

  try {
    const [activities, totalItems] = await Promise.all([
      SpecialActivity.find(filter).limit(limit).skip(skip).exec(),
      SpecialActivity.countDocuments(filter),
    ]);
    return res.status(200).json({
      activities,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (_error) {
    return res.status(500).json({ error: "Unable to filter activities right now." });
  }
};

const getActivity = async (req, res) => {
  try {
    const activity = await SpecialActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });
    // Pending/declined activities are private to their owner and administrators.
    if (activity.status !== "APPROVED" && !isOwnerOrAdmin(activity.user, req)) {
      return res.status(404).json({ error: "Activity not found" });
    }
    return res.status(200).json(activity);
  } catch (_error) {
    return res.status(400).json({ error: "Unable to load activity" });
  }
};

module.exports = {
  createActivity,
  approveActivity,
  getApprovedActivities,
  getPendingActivities,
  declineActivity,
  filterActivities,
  getMyActivities,
  getActivity,
  deleteActivity,
};
