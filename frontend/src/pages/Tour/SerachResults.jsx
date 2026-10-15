import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import TourNav from "../../components/navbar/TourNav";
import { formatMoney } from "../../utils/globalTravel";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80";

const normalize = (value) => String(value || "").trim().toLocaleLowerCase();

const SearchResults = () => {
  const routeParams = useParams();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get("destination") || routeParams.destination || "";
  const duration = searchParams.get("duration") || routeParams.duration || "";
  const groupSize = searchParams.get("groupSize") || searchParams.get("maxsize") || routeParams.maxsize || "";

  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    axios.get("/tours")
      .then((response) => {
        if (!active) return;
        setAllTours(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load tour listings right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const filteredTours = useMemo(() => {
    const searchTerms = normalize(destination).split(",").map((term) => term.trim()).filter(Boolean);
    return allTours.filter((tour) => {
      const searchableText = normalize([
        tour.name,
        tour.cities,
        tour.country,
        tour.description,
        tour.introduction,
        tour.category,
      ].filter(Boolean).join(" "));

      const matchesDestination = searchTerms.length === 0 || searchTerms.every((term) => searchableText.includes(term));
      const matchesDuration = !duration || Number(tour.duration) === Number(duration);
      const capacity = Number(tour.groupCount);
      const requestedGroup = Number(groupSize);
      const matchesGroupSize = !groupSize || (Number.isFinite(capacity) && capacity >= requestedGroup);
      return matchesDestination && matchesDuration && matchesGroupSize;
    });
  }, [allTours, destination, duration, groupSize]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-white sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-blue-950" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Worldwide tour discovery</p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Explore {destination ? destination : "your next destination"}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">Tour listings are matched by destination, with duration and group-size filters applied when provided.</p>
        </div>
      </section>

      <TourNav />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Tour results</h2>
            <p className="mt-1 text-slate-600">{loading ? "Searching available listings…" : `${filteredTours.length} matching tour(s)`}</p>
          </div>
          <Link to="/tours/home" className="text-sm font-semibold text-blue-700 hover:underline">Change search</Link>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)}
          </div>
        ) : !error && filteredTours.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-slate-950">No tours match these filters yet</h3>
            <p className="mx-auto mt-2 max-w-2xl leading-7 text-slate-600">Try a city or country name on its own, remove the duration/group-size filters, or check back as providers add more destinations. Search results reflect listings currently stored in Travelco, not every tour available worldwide.</p>
            <Link to="/tours/home" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Search another destination</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <article key={tour._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={tour.img || FALLBACK_IMAGE}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
                  alt={tour.name ? tour.name : "Tour"}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-950">{tour.name || "Tour package"}</h3>
                  <p className="mt-2 text-sm text-slate-600">{[tour.cities, tour.country].filter(Boolean).join(" · ") || "Destination not provided"}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    {tour.duration && <span className="rounded-full bg-slate-100 px-3 py-1">{tour.duration} day(s)</span>}
                    {tour.groupCount && <span className="rounded-full bg-slate-100 px-3 py-1">Up to {tour.groupCount} travelers</span>}
                    {tour.category && <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{tour.category}</span>}
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-950">{formatMoney(tour.price, tour.currency || "USD")} <span className="text-xs font-normal text-slate-500">/ person</span></p>
                    <Link to={`/tours/${tour._id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">View details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchResults;
