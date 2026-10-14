import React, { useContext, useEffect, useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { formatMoney } from "../../utils/globalTravel";

const HotelReserve = ({ setOpen, hotelId, checkInDate, checkOutDate, date_difference, currency = "USD" }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { data = [], loading } = useFetch(`/hotels/room/${hotelId}`);

  useEffect(() => {
    const roomPrice = (data || []).reduce((sum, room) => {
      const selectedRoomCount = (room.roomNumbers || []).filter((number) => selectedRooms.includes(String(number._id))).length;
      return sum + selectedRoomCount * Number(room.price || 0);
    }, 0);
    setTotalPrice(roomPrice * Number(date_difference || 0));
  }, [selectedRooms, data, date_difference]);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    for (let day = new Date(start); day < end; day.setUTCDate(day.getUTCDate() + 1)) {
      dates.push(new Date(day).getTime());
    }
    return dates;
  };

  const alldates = getDatesInRange(checkInDate, checkOutDate);
  const isAvailable = (roomNumber) => !(roomNumber.unavailableDates || []).some((date) => {
    const value = new Date(date);
    value.setUTCHours(0, 0, 0, 0);
    return alldates.includes(value.getTime());
  });

  const handleSelect = (event) => {
    const { checked, value } = event.target;
    setSelectedRooms((current) => checked
      ? [...new Set([...current, value])]
      : current.filter((roomId) => roomId !== value));
  };

  const handleClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (selectedRooms.length === 0) {
      setError("Select at least one available room.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await axios.post("/hotelreservation/reservation", {
        hotelId,
        selectedRoomIds: selectedRooms,
        checkInDate,
        checkOutDate
      });
      setOpen(false);
      navigate("/hotelhome", { state: { reservation: response.data.reservation } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reserve these rooms. Please refresh availability and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 p-3">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Choose your rooms</h2>
          <button type="button" aria-label="Close room selection" onClick={() => setOpen(false)}>
            <FaWindowClose className="cursor-pointer text-2xl text-gray-600 hover:text-red-500" />
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">{checkInDate} to {checkOutDate} · {date_difference} night(s)</p>
        {loading && <p className="py-6">Loading available rooms…</p>}
        {!loading && (data || []).length === 0 && <p className="py-6 text-slate-600">No room types are listed for this property yet.</p>}
        {(data || []).map((room) => (
          <section className="my-5 border-b pb-5" key={room._id}>
            <h3 className="font-bold">{room.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{room.description}</p>
            <p className="mt-2 text-sm">Maximum guests: {room.maxPeople}</p>
            <p className="mt-1 font-semibold">{formatMoney(room.price, currency)} per night</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(room.roomNumbers || []).map((roomNumber) => {
                const available = isAvailable(roomNumber);
                return (
                  <label className="flex items-center gap-2 rounded-lg border p-3 text-sm" key={roomNumber._id}>
                    <input type="checkbox" value={roomNumber._id} checked={selectedRooms.includes(String(roomNumber._id))} onChange={handleSelect} disabled={!available || submitting} />
                    <span>Room {roomNumber.number}</span>
                    <span className={available ? "text-green-700" : "text-red-600"}>{available ? "Available" : "Unavailable"}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-bold">Estimated total: {formatMoney(totalPrice, currency)}</p>
          <button type="button" onClick={handleClick} disabled={submitting || loading || selectedRooms.length === 0} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {submitting ? "Reserving…" : "Reserve rooms"}
          </button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <p className="mt-4 text-xs text-slate-500">This creates a reservation request only. Travelco payment processing is not enabled, so no payment is collected here.</p>
      </div>
    </div>
  );
};

export default HotelReserve;
