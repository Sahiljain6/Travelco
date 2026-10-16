const Tour = require("../models/tours");
const { parsePositiveNumber, parsePositiveInteger } = require("../utils/validation");

//Route Handlers
//create tour
const createTour = async (req, res) => {
  try {
    const body = { ...(req.body || {}) };
    const price = parsePositiveNumber(body.price);
    const groupCount = parsePositiveInteger(body.groupCount);
    const duration = parsePositiveInteger(body.duration);
    if (price === null) return res.status(400).json({ message: "Tour price must be greater than zero. Decimal values are allowed." });
    if (groupCount === null) return res.status(400).json({ message: "Group size must be a positive whole number." });
    if (duration === null) return res.status(400).json({ message: "Tour duration must be a positive whole number." });
    body.price = price;
    body.groupCount = groupCount;
    body.duration = String(duration);
    const newTour = new Tour(body);
    const savedTour = await newTour.save();
    return res.status(201).json({
      status: "Success",
      message: "Tour Adding successfull",
      data: { tour: savedTour },
    });
  } catch (error) {
    return res.status(400).json({ status: "Unsuccess", message: error.message || "Unable to create tour" });
  }
};

//getAll tour list
const getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find();
    res.status(200).send(allTours);
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

//find tour by id
const getTour = async (req, res) => {
  try {
    const uID = req.params.id;

    const oneTour = await Tour.findById(uID);
    res.status(200).json({
      status: "Success",
      data: {
        oneTour,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

//update a tour
const updateTour = async (req, res) => {
  try {
    const body = { ...(req.body || {}) };
    if (body.price !== undefined) {
      const price = parsePositiveNumber(body.price);
      if (price === null) return res.status(400).json({ message: "Tour price must be greater than zero. Decimal values are allowed." });
      body.price = price;
    }
    if (body.groupCount !== undefined) {
      const groupCount = parsePositiveInteger(body.groupCount);
      if (groupCount === null) return res.status(400).json({ message: "Group size must be a positive whole number." });
      body.groupCount = groupCount;
    }
    if (body.duration !== undefined) {
      const duration = parsePositiveInteger(body.duration);
      if (duration === null) return res.status(400).json({ message: "Tour duration must be a positive whole number." });
      body.duration = String(duration);
    }
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true });
    if (!updatedTour) return res.status(404).json({ message: "Tour not found" });
    return res.status(200).json({ status: "Success", data: { tour: updatedTour } });
  } catch (error) {
    return res.status(400).json({ status: "Unsuccess", message: error.message || "Unable to update tour" });
  }
};

//delete a tour
const deleteTour = async (req, res) => {
  try {
    const UID = req.params.id;
    const deletedTour = await Tour.findByIdAndDelete(UID);

    res.status(204).json({
      status: "Success",
      data: {
        old: deletedTour,
        tour: "Null",
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

module.exports = {
  createTour,
  updateTour,
  getAllTours,
  getTour,
  deleteTour,
};
