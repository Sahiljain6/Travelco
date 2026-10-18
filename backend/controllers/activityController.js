const SpecialActivity = require('../models/SpecialActivityModel.js');
const { parsePagination } = require("../utils/pagination");

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
    const activities = await SpecialActivity.find()
      .limit(limit)
      .skip(skip)
      .exec();

    const count = await SpecialActivity.countDocuments();

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
    const activityId = req.params.id;
    const updatedActivity = await SpecialActivity.findOneAndDelete(activityId);
    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const filterActivities = async (req, res) => {
  try {
    const { name, type, startDate, endDate, startTime, endTime, searchQuery } =
      req.query;

    const filter = { status: 'APPROVED' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (type) filter.type = type;

    if (startDate && endDate)
      filter['dateRange.startDate'] = { $lte: moment(endDate).toDate() };
    if (startDate && endDate)
      filter['dateRange.endDate'] = { $gte: moment(startDate).toDate() };
    if (startTime && endTime) filter['timeRange.startTime'] = { $lte: endTime };
    if (startTime && endTime) filter['timeRange.endTime'] = { $gte: startTime };

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const activities = await SpecialActivity.find(filter);
    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = await SpecialActivity.findById(activityId);
    res.status(200).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
