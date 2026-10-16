import React, { useState } from "react";
import { RiMapPin5Fill } from "react-icons/ri";
import { BsPeopleFill } from "react-icons/bs";
import { MdAccessTimeFilled } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [error, setError] = useState("");

  const searchHandler = (event) => {
    event.preventDefault();
    setError("");

    if (!destination.trim()) {
      setError("Enter a destination city or country to search.");
      return;
    }
    if (duration && (!Number.isInteger(Number(duration)) || Number(duration) < 1 || Number(duration) > 90)) {
      setError("Trip length must be between 1 and 90 days.");
      return;
    }
    if (groupSize && (!Number.isInteger(Number(groupSize)) || Number(groupSize) < 1 || Number(groupSize) > 500)) {
      setError("Group size must be between 1 and 500 travelers.");
      return;
    }

    const params = new URLSearchParams();
    params.set("destination", destination.trim());
    if (duration) params.set("duration", duration);
    if (groupSize) params.set("groupSize", groupSize);
    navigate(`/tours/search?${params.toString()}`);
  };

  return (
    <form onSubmit={searchHandler} className="rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><RiMapPin5Fill aria-hidden="true" /> Destination</span>
          <input
            type="text"
            id="tour-destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            maxLength={120}
            autoComplete="off"
            placeholder="City or country, e.g. Tokyo, Japan"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><MdAccessTimeFilled aria-hidden="true" /> Trip length</span>
          <input
            type="number"
            id="tour-duration"
            step="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            min="1"
            max="90"
            placeholder="Any duration"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><BsPeopleFill aria-hidden="true" /> Travelers</span>
          <input
            type="number"
            id="tour-group-size"
            step="1"
            value={groupSize}
            onChange={(event) => setGroupSize(event.target.value)}
            min="1"
            max="500"
            placeholder="Any group size"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <div className="flex items-end">
          <button type="submit" className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold uppercase text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1ZM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" />
            </svg>
            Search tours
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
    </form>
  );
};

export default SearchBar;
