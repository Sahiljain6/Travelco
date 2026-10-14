const ResturentReservation = require("../models/resturentReservationModel");

const getRestaurantReservations = async (req, res, next) => {
    try {
        const restaurantReservations = await ResturentReservation.find();
        res.status(200).json(restaurantReservations);
    } catch (err) {
        next(err);
    }
};

const createReservation = async (req, res, next) => {
    const newReservation = new ResturentReservation(req.body);
    const existingReservation = await ResturentReservation.find({
        resturent: newReservation.resturent,
        tableNo: newReservation.tableNo,
        date: newReservation.date,
        time: newReservation.time
    });
    try {
        if (existingReservation.length != 0) {
            return res.status(200).json({ existingReservation, error: true, message: "Table Booked Already" });
        }
        const savedReservation = await newReservation.save();
        res.status(200).json({ error: false, newReservation });
    } catch (err) {
        next(err);
    }
}

const getRerservationRequests = async (req, res, next) => {
    const id = req.body.user;
    const reservation = await ResturentReservation.find({ status: 'PENDING' }).populate({
        path: 'resturent',
        populate: {
            path: 'returentType',
        },
        match: { user: id },
    }).populate('user').populate('time');
    try {
        if (reservation.length != 0) {
            return res.status(200).json(reservation);
        }
        return res.status(200).json({ error: true, message: "No Reservations Found!" });
    } catch (err) {
        next(err);
    }
}

const getRerservationRequestsCanceled = async (req, res, next) => {
    const id = req.body.user;
    const reservation = await ResturentReservation.find({ status: 'USER_CANCELD' }).populate({
        path: 'resturent',
        populate: {
            path: 'returentType',
        },
        match: { user: id },
    }).populate('user').populate('time');
    try {
        if (reservation.length != 0) {
            return res.status(200).json(reservation);
        }
        return res.status(200).json({ error: true, message: "No Reservations Found!" });
    } catch (err) {
        next(err);
    }
}
const getRerservationRequestsByUser = async (req, res, next) => {
    try {
        const reservations = await ResturentReservation.find({ user: req.user })
            .populate({ path: "resturent", populate: [{ path: "returentType" }, { path: "district" }] })
            .populate("user")
            .populate("time");
        return res.status(200).json(reservations);
    } catch (err) {
        next(err);
    }
};
const getRerservationRequestById = async (req, res, next) => {
    try {
        const reservation = await ResturentReservation.findById(req.body.id)
            .populate({ path: "resturent", populate: [{ path: "returentType" }, { path: "district" }] })
            .populate("user")
            .populate("time");
        if (!reservation) return res.status(404).json({ error: true, message: "Reservation not found" });
        const reservationUserId = reservation.user?._id || reservation.user;
        if (String(reservationUserId) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ error: true, message: "You cannot view this reservation" });
        }
        return res.status(200).json(reservation);
    } catch (err) {
        next(err);
    }
};
const acceptReservation = async (req, res, next) => {
    const id = req.body.id;
    const reservation = await ResturentReservation.find({ _id: id });
    const update = { $set: { status: 'ACCEPTED' } }
    if (reservation.length != 0) {
        ResturentReservation.updateOne({ _id: id }, update)
            .then(result => {
                return res.status(200).json({ error: false, message: "Reservation Accepted!" });
                console.log(result);
            })
            .catch(error => {
                return res.status(200).json({ error: true, errd: err, message: "No Reservation Requests Found!" });
            });

    }
}
const declineReservation = async (req, res, next) => {
    const id = req.body.id;
    const reservation = await ResturentReservation.find({ _id: id });
    const update = { $set: { status: 'REJECTED' } }
    if (reservation.length != 0) {
        ResturentReservation.updateOne({ _id: id }, update)
            .then(result => {
                return res.status(200).json({ error: false, message: "Reservation Declined!" });
                console.log(result);
            })
            .catch(error => {
                return res.status(200).json({ error: true, errd: err, message: "No Reservation Requests Found!" });
            });

    }
}

module.exports = {
    getRestaurantReservations,
    createReservation,
    getRerservationRequests,
    acceptReservation,
    declineReservation,
    getRerservationRequestsCanceled,
    getRerservationRequestsByUser,
    getRerservationRequestById,
};
