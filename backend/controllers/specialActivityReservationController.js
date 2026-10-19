const Reservation = require('../models/reservationModel.js');
const SpecialActivity = require('../models/SpecialActivityModel.js');
const { isOwnerOrAdmin } = require('../utils/authorization.js');

const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user }).populate('activity', 'name type description status');
        res.status(200).json(reservations);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};



const getPendingReservations = async (req, res) => {
    const user = req.user;
    try {

        const specialActivities = await SpecialActivity.find({ user: user }, '_id');
        const activityIds = specialActivities.map(activity => activity._id);
        const pendingReservations = await Reservation.find({
            activity: { $in: activityIds },
            status: 'PENDING',
        }).populate('user', 'name email').populate('activity', 'name type location user');

        res.status(200).json({ pendingReservations });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


async function changeReservationStatus(req, res, status) {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('activity', 'user');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        if (!isOwnerOrAdmin(reservation.activity && reservation.activity.user, req)) {
            return res.status(403).json({ message: 'You cannot manage another organizer\'s reservations' });
        }
        if (reservation.status !== 'PENDING') {
            return res.status(409).json({ message: 'Only pending reservations can be changed' });
        }
        reservation.status = status;
        await reservation.save();
        return res.status(200).json({ reservation });
    } catch (_error) {
        return res.status(400).json({ message: 'Unable to update reservation status' });
    }
}

const declineReservation = (req, res) => changeReservationStatus(req, res, 'DECLINED');
const approveReservation = (req, res) => changeReservationStatus(req, res, 'APPROVED');




const createReservation = async (req, res) => {
    try {
        const { activity_id, startDate, startTime, endDate, endTime } = req.body || {};
        if (typeof activity_id !== 'string' || !/^[a-f0-9]{24}$/i.test(activity_id)) {
            return res.status(400).json({ message: 'A valid activity is required' });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!startDate || !endDate || Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({ message: 'A valid reservation date range is required' });
        }
        if (typeof startTime !== 'string' || typeof endTime !== 'string' ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
            return res.status(400).json({ message: 'Valid start and end times are required' });
        }
        const activity = await SpecialActivity.findOne({ _id: activity_id, status: 'APPROVED' }).select('_id');
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        const reservation = new Reservation({
            user: req.user,
            dateRange: { startDate: start, endDate: end },
            timeRange: { startTime, endTime },
            activity: activity._id,
            status: 'PENDING',
        });
        const savedReservation = await reservation.save();
        return res.status(201).json(savedReservation);
    } catch (_error) {
        return res.status(400).json({ message: 'Unable to create reservation with the supplied details' });
    }
};


const deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        if (!isOwnerOrAdmin(reservation.user, req)) {
            return res.status(403).json({ message: 'You can only cancel your own reservation' });
        }
        await reservation.deleteOne();
        return res.status(200).json({ message: 'Reservation cancelled' });
    } catch (_error) {
        return res.status(400).json({ message: 'Unable to cancel reservation' });
    }
};

module.exports = { getMyReservations, createReservation, deleteReservation, getPendingReservations, declineReservation, approveReservation };
