import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Searchbar = () => {
  const [vehicleType, setVehicleType] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const searchVehicles = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const location = pickupLocation.trim();
    const encodedLocation = encodeURIComponent(location);
    const url = location && vehicleType
      ? `/vehicle/get/${encodeURIComponent(vehicleType)}/${encodedLocation}`
      : location
        ? `/vehicle/location/get/${encodedLocation}`
        : vehicleType
          ? `/vehicle/type/get/${encodeURIComponent(vehicleType)}`
          : "/vehicle/";
    try {
      const response = await axios.get(url);
      navigate("/vehicles", { state: response.data });
    } catch {
      setError("Vehicle search is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-3xl rounded-xl bg-white p-5 shadow-lg lg:-mt-12">
      <form onSubmit={searchVehicles} className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="vehicleType" className="mb-2 block font-semibold">Vehicle type</label>
          <select id="vehicleType" className="w-full rounded-md border p-3" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
            <option value="">All vehicle types</option>
            <option value="E-Vehicles">Electric vehicles</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
            <option value="Motor Bike">Motorbike</option>
            <option value="Tuk Tuk">Tuk-tuk</option>
            <option value="Bus">Bus</option>
          </select>
        </div>
        <div className="flex-[2]">
          <label htmlFor="pickupLocation" className="mb-2 block font-semibold">Destination</label>
          <input id="pickupLocation" type="text" className="w-full rounded-md border p-3" placeholder="City, region, country or airport" value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} maxLength={120} />
        </div>
        <button type="submit" disabled={loading} className="rounded-md bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-60">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Searchbar;
