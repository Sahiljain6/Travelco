const SeatBookingTrain = require("../models/SeatBooking");
const path = require("path")

// add seat booking - tourists
const addSeatBooking = async(req,res)=>{
    const newSeatBooking = new SeatBookingTrain({
        ...req.body,
        userId: String(req.user),
        isApproved: false
    })

    await newSeatBooking.save().then((newSeatBooking)=>{
        res.json(newSeatBooking);
    }).catch((err)=>{
        res.json(err.message);
    })
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
        const allowed = ["firstName", "LastName", "nationality", "IdCardNumber", "phoneNumber", "email", "noOfTickets"];
        for (const field of allowed) {
            if (req.body[field] !== undefined) booking[field] = req.body[field];
        }
        await booking.save();
        return res.status(200).json({ status: "updated", booking });
    } catch {
        return res.status(500).json({ message: "Unable to update ticket" });
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