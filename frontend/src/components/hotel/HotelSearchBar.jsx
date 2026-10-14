import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const toLocalDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (value, amount) => {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  date.setDate(date.getDate() + amount);
  return toLocalDateInput(date);
};

export const HotelSearchBar = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const today = toLocalDateInput(new Date());
  const minCheckOut = checkInDate ? addDays(checkInDate, 1) : addDays(today, 1);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!city.trim()) {
      setError("Enter a city or country to search for hotels.");
      return;
    }
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setError("Choose a valid check-in date and a check-out date at least one day later.");
      return;
    }
    setSearching(true);
    try {
      const response = await axios.get(`/hotels/get/${encodeURIComponent(city.trim())}`);
      const hotels = Array.isArray(response.data) ? response.data : [];
      navigate("/hotelhome", {
        state: {
          date: { checkInDate, checkOutDate },
          data: hotels,
        },
      });
      if (hotels.length === 0) setError("No approved hotels matched that location. Try a nearby city or country.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to search hotels right now. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="mx-auto mt-4 w-full max-w-7xl rounded-2xl border border-slate-100 bg-white px-4 py-5 shadow-lg sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="flex flex-col">
          <label htmlFor="hotel-destination" className="mb-2 font-medium text-slate-900">Location</label>
          <input id="hotel-destination" type="text" required maxLength={120} value={city} onChange={(event) => setCity(event.target.value)} placeholder="Where are you going?" autoComplete="off" className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="hotel-check-in" className="mb-2 font-medium text-slate-900">Check-in date</label>
          <input id="hotel-check-in" type="date" required min={today} value={checkInDate} onChange={(event) => {
            const nextDate = event.target.value;
            setCheckInDate(nextDate);
            if (checkOutDate && checkOutDate <= nextDate) setCheckOutDate("");
          }} className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="hotel-check-out" className="mb-2 font-medium text-slate-900">Check-out date</label>
          <input id="hotel-check-out" type="date" required min={minCheckOut} value={checkOutDate} onChange={(event) => setCheckOutDate(event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <button type="submit" disabled={searching} className="min-h-[48px] rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {searching ? "Searching…" : "Search hotels"}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
};
