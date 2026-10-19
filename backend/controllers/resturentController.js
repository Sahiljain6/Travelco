const Resturent = require("../models/resturentModel");
const { escapeRegex } = require("../utils/securityValidation");

const createResturent = async (req, res, next) => {
    const isAdmin = req.authUser?.isAdmin === true;
    if (!isAdmin && req.authUser?.type !== "resturentOwner") {
        return res.status(403).json({ message: "Restaurant-owner access is required to submit a listing" });
    }

    const allowedFields = [
        "name", "district", "address", "pricePerHour", "tableCount",
        "chefQualification", "resturentImages", "registrationImages",
        "returentType", "staffAmount", "mobileNo", "registrationNo"
    ];
    const payload = {};
    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) payload[field] = req.body[field];
    }
    payload.user = req.user;
    // A listing owner cannot publish a record by injecting status into the request.
    payload.status = isAdmin && req.body?.status === "APPROVED" ? "APPROVED" : "PENDING";

    try {
        const newResturent = new Resturent(payload);
        const existingRestaurant = await Resturent.findOne({ registrationNo: newResturent.registrationNo });
        if (existingRestaurant) {
            return res.status(409).json({ error: true, message: "Restaurant already exists" });
        }
        const savedResturent = await newResturent.save();
        return res.status(201).json(savedResturent);
    } catch (_error) {
        return res.status(400).json({ message: "Unable to submit restaurant listing. Check the supplied fields." });
    }
};


const findResturentById = async (req, res, next) => {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    try {
        const restaurant = await Resturent.findOne({ _id: id, status: "APPROVED" }).populate("district");
        if (!restaurant) return res.status(404).json({ error: true, message: "No restaurant found" });
        return res.status(200).json(restaurant);
    } catch (_error) {
        return res.status(400).json({ error: true, message: "Invalid restaurant identifier" });
    }
};

const findResturentByName = async (req, res, next) => {
    const name = typeof req.body?.query === "string" ? req.body.query.trim().slice(0, 80) : "";
    if (!name) return res.status(400).json({ error: true, message: "A restaurant name is required" });
    try {
        const regex = new RegExp(escapeRegex(name), "i");
        const restaurants = await Resturent.find({ name: regex, status: "APPROVED" })
            .populate("district")
            .limit(50)
            .select("-__v");
        if (!restaurants.length) return res.status(200).json({ error: true, message: "No restaurants found" });
        return res.status(200).json(restaurants);
    } catch (_error) {
        return res.status(400).json({ error: true, message: "Unable to search restaurants" });
    }
};

const findFirstFiveResturents = async (req, res, next) => {
    try {
        const restaurants = await Resturent.find({ status: "APPROVED" })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("district")
            .select("-__v");
        if (!restaurants.length) return res.status(200).json({ error: true, message: "No restaurants found" });
        return res.status(200).json(restaurants);
    } catch (_error) {
        return res.status(500).json({ error: true, message: "Unable to load restaurants" });
    }
};

module.exports = {
    createResturent,
    findResturentByName,
    findFirstFiveResturents,
    findResturentById
};
