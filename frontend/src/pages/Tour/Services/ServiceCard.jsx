import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatMoney } from "../../../utils/globalTravel";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80";

const ServiceCard = () => {
  const [allTours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get("/tours")
      .then((response) => {
        if (active) setTours(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load tour listings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <p className="py-8 text-slate-500">Loading tour packages…</p>;
  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>;
  if (allTours.length === 0) return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-slate-600">
      No tour packages have been published yet. Providers can add packages for any destination.
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {allTours.map((tour) => (
        <article key={tour._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <img
            src={tour.img || FALLBACK_IMAGE}
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
            alt={tour.name || "Tour"}
            loading="lazy"
            className="h-56 w-full object-cover"
          />
          <div className="p-5">
            <h3 className="text-xl font-bold text-slate-950">{tour.name || "Tour package"}</h3>
            <p className="mt-2 text-sm text-slate-600">{[tour.cities, tour.country].filter(Boolean).join(" · ") || "Destination not provided"}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              {tour.duration && <span className="rounded-full bg-slate-100 px-3 py-1">{tour.duration} day(s)</span>}
              {tour.groupCount && <span className="rounded-full bg-slate-100 px-3 py-1">Up to {tour.groupCount} travelers</span>}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="font-bold text-slate-950">{formatMoney(tour.price, tour.currency || "USD")} <span className="text-xs font-normal text-slate-500">/ person</span></p>
              <Link to={`/tours/${tour._id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">View details</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ServiceCard;
