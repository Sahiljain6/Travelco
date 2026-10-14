const SeatBookingFlight = require("../models/FlightSeatBooking")
const axios = require("axios");

// get all the selected flights   -- search
const searchFlight = async (req,res)=>{
    const input = req.query || req.body || {};
    const from = input.from;
    const to = input.to;
    const travelclass = input.travelclass;
    const depatureDate = input.depatureDate;
    const returnDate = input.returnDate;
    const passengerCount = input.passengerCount;

    if (!process.env.SKYSCANNER_RAPIDAPI_KEY) {
        return res.status(503).json({ message: "Flight search is not configured on this server" });
    }
    if (!from || !to || !depatureDate || !Number.isInteger(Number(passengerCount)) || Number(passengerCount) < 1 || Number(passengerCount) > 9) {
        return res.status(400).json({ message: "Valid origin, destination, departure date, and 1–9 passengers are required" });
    }
    const options = {
        method: 'GET',
        url: 'https://skyscanner44.p.rapidapi.com/search-extended',
        params: {adults: passengerCount, origin: from, destination: to, departureDate: depatureDate},
        headers: {
          'X-RapidAPI-Key': process.env.SKYSCANNER_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          return res.status(200).json(response.data?.itineraries?.results || []);
      } catch {
          return res.status(502).json({ message: "Flight search provider is temporarily unavailable" });
      }
}


//flight seat booking -  tourist
const flightBooking =  async (req,res)=>{
    const newSeatBookingFlight = new SeatBookingFlight({
        ...req.body,
        userID: String(req.user),
        isApproved: false
    })
    
    await newSeatBookingFlight.save().then((newSeatBookingFlight)=>{
        res.json(newSeatBookingFlight)
    }).catch((err)=>{
        res.json(err.message)
    })
}

//fetch all flight train booking -admin (that need to review)
const fetchAllFlightBookings = async(req,res)=>{
    await SeatBookingFlight.find().then((allBooking)=>{
        res.json(allBooking);
    }).catch((err)=>{
        res.json(err.message)
    })
}

// fetch single seat booking - tourist and admin
const getSingleFlightBooking = async (req, res) => {
    try {
        const booking = await SeatBookingFlight.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Flight ticket not found" });
        if (String(booking.userID) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You cannot view this flight ticket" });
        }
        return res.status(200).json(booking);
    } catch {
        return res.status(500).json({ message: "Unable to retrieve flight ticket" });
    }
}
// fetch all the tickets of single user
const getMyAllTickets = async (req, res) => {
    try {
        const requestedId = req.params.id;
        if (String(requestedId) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You can only view your own flight tickets" });
        }
        const bookings = await SeatBookingFlight.find({ userID: String(req.user) });
        return res.status(200).json(bookings);
    } catch {
        return res.status(500).json({ message: "Unable to retrieve flight tickets" });
    }
}


// deletee seat Reservation    - tourist
const deleteSeatBooking = async (req, res) => {
    try {
        const booking = await SeatBookingFlight.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Flight ticket not found" });
        if (String(booking.userID) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You cannot cancel this flight ticket" });
        }
        await booking.deleteOne();
        return res.status(200).json({ message: "Flight ticket cancelled" });
    } catch {
        return res.status(500).json({ message: "Unable to cancel flight ticket" });
    }
};

const updateSeatBookingFlight = async (req, res) => {
    try {
        const booking = await SeatBookingFlight.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Flight ticket not found" });
        if (String(booking.userID) !== String(req.user) && req.authUser?.isAdmin !== true) {
            return res.status(403).json({ message: "You cannot update this flight ticket" });
        }
        const allowed = ["firstName", "LastName", "nationality", "IdCardNumber", "phoneNumber", "email"];
        for (const field of allowed) {
            if (req.body[field] !== undefined) booking[field] = req.body[field];
        }
        await booking.save();
        return res.status(200).json({ status: "updated", booking });
    } catch {
        return res.status(500).json({ message: "Unable to update flight ticket" });
    }
};

module.exports={
    searchFlight,
    flightBooking,
    fetchAllFlightBookings,
    getSingleFlightBooking,
    deleteSeatBooking,
    updateSeatBookingFlight,
    getMyAllTickets
}