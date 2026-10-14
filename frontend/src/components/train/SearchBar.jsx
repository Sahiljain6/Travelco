import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const searchTrains = async (event) => {
    event.preventDefault();
    const origin = from.trim();
    const destination = to.trim();
    if (!origin || !destination) {
      setError("Enter both a departure and arrival station or city.");
      return;
    }
    if (origin.toLowerCase() === destination.toLowerCase()) {
      setError("Departure and arrival must be different locations.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`/train/fetch/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`);
      navigate("/TrainHome", { state: response.data });
    } catch {
      setError("Train search is temporarily unavailable for this route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-5xl rounded-xl bg-white p-5 shadow-lg lg:-mt-12">
      <form onSubmit={searchTrains} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="trainFrom" className="mb-2 block font-semibold">From</label>
          <input id="trainFrom" type="text" className="w-full rounded-md border p-3" placeholder="Departure station or city" value={from} onChange={(event) => setFrom(event.target.value)} maxLength={120} required />
        </div>
        <div>
          <label htmlFor="trainTo" className="mb-2 block font-semibold">To</label>
          <input id="trainTo" type="text" className="w-full rounded-md border p-3" placeholder="Arrival station or city" value={to} onChange={(event) => setTo(event.target.value)} maxLength={120} required />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-60 md:w-auto">
            {loading ? "Searching…" : "Search trains"}
          </button>
        </div>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-slate-500">Search uses routes available in Travelco's configured train inventory; live schedules depend on regional data providers.</p>
    </div>
  );
};

export default SearchBar;
