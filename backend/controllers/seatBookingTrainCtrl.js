const SeatBookingTrain = require("../models/SeatBooking");
const path = require("path");
const { isValidInternationalPhone, parsePositiveInteger } = require("../utils/validation");

// add seat booking - tourists
const addSeatBooking = async (req, res) => {
    if (!isValidInternationalPhone(req.body?.phoneNumber)) {
        return res.status(400).json({ message: "Enter a valid international phone number with 7–15 digits; it cannot be all zeroes." });
    }
    const noOfTickets = parsePositiveInteger(req.body?.noOfTickets);
    if (noOfTickets === null) {
        return res.status(400).json({ message: "Ticket count must be a positive whole number." });
    }

    try {
        const newSeatBooking = new SeatBookingTrain({
            ...req.body,
            phoneNumber: String(req.body.phoneNumber).trim(),
            noOfTickets,
            userId: String(req.user),
            isApproved: false
        });
        await newSeatBooking.save();
        return res.status(201).json(newSeatBooking);
    } catch (error) {
        return res.status(400).json({ message: error.message || "Unable to create ticket booking." });
    }
}

// fetch all tickets - admin (that need to review)
const fetchAllBookings =  async(req,res)=>{
    await SeatBookingTrain.find().then((allBooking)=>{
        res.json(allBooking);
    }).catch((err)=>{
        res.json(err.message);
    })
}
// fetch all tickets of single user  - tourits
const myBookings = ((req,res)=>{
    const ID = String(req.user);

    SeatBookingTrain.find({userId: ID}).then((booking)=>{
        res.json(booking);
    }).catch((err)=>{
        res.json(err.message)
    })
}) 





// fetch single seat booking   - tourists and admin
const getSingleSeatBooking = async(req,res)=>{
    const id = req.params.id;

    try {
        const booking = await SeatBookingTrain.findById(id);
        if (!booking) return res.status(404).json({ message: "Ticket not found" });
        if (String(booking.userId) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You cannot view this ticket" });
        }
        return res.status(200).json(booking);
    } catch {
        return res.status(500).json({ message: "Unable to retrieve ticket" });
    }
}

// delete seatReservation  -  tourists
const deleteSeatBooking = async(req,res)=>{
    const id = req.params.id;

    try {
        const booking = await SeatBookingTrain.findById(id);
        if (!booking) return res.status(404).json({ message: "Ticket not found" });
        if (String(booking.userId) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You cannot cancel this ticket" });
        }
        await booking.deleteOne();
        return res.status(200).json({ message: "Ticket cancelled" });
    } catch {
        return res.status(500).json({ message: "Unable to cancel ticket" });
    }
}

// update seatReservation -  tourists
const updateSeatBooking = async (req, res) => {
    try {
        const booking = await SeatBookingTrain.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Ticket not found" });
        if (String(booking.userId) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You cannot update this ticket" });
        }
        const update = req.body || {};
        const allowed = ["firstName", "LastName", "nationality", "IdCardNumber", "phoneNumber", "email", "noOfTickets"];
        if (update.phoneNumber !== undefined && !isValidInternationalPhone(update.phoneNumber)) {
            return res.status(400).json({ message: "Enter a valid international phone number with 7–15 digits; it cannot be all zeroes." });
        }
        if (update.noOfTickets !== undefined) {
            const count = parsePositiveInteger(update.noOfTickets);
            if (count === null) return res.status(400).json({ message: "Ticket count must be a positive whole number." });
            booking.noOfTickets = count;
        }
        for (const field of allowed) {
            if (field === "noOfTickets") continue;
            if (update[field] !== undefined) booking[field] = update[field];
        }
        if (update.phoneNumber !== undefined) booking.phoneNumber = String(update.phoneNumber).trim();
        await booking.save();
        return res.status(200).json({ status: "updated", booking });
    } catch (error) {
        return res.status(400).json({ message: error.message || "Unable to update ticket" });
    }
};

module.exports = {
    addSeatBooking,
    getSingleSeatBooking,
    deleteSeatBooking,
    updateSeatBooking,
    fetchAllBookings,
    myBookings
}