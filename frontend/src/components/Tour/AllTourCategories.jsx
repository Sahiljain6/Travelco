import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import NavigatedMenu from "../navbar/NavigatedMenu";
import TourNav from "../navbar/TourNav";
import HeroTour from "../../pages/Tour/HeroTour";
import { formatMoney } from "../../utils/globalTravel";

const CATEGORY_ALIASES = {
  sunandbeach: ["sunandbeach", "beach", "beaches", "islands"],
  hikingandtrekking: ["hikingandtrekking", "hiking", "trekking", "mountains", "nature"],
  wildsafari: ["wildsafari", "safari", "wildlife"],
  cultural: ["cultural", "culture", "heritage"],
  special: ["special", "specialtours", "localexperiences", "food", "experiences"],
  festival: ["festival", "festivals", "events"],
};

const normalize = (value) => String(value || "").toLocaleLowerCase().replace(/[^a-z0-9]/g, "");

const AllTourCategories = () => {
  const { pathname } = useLocation();
  const slug = pathname.split("/").filter(Boolean).pop() || "";
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    axios.get("/tours")
      .then((response) => {
        if (active) setAllTours(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load tour listings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categoryTours = useMemo(() => {
    const aliases = CATEGORY_ALIASES[slug] || [normalize(slug)];
    return allTours.filter((tour) => {
      const category = normalize(tour.category);
      return aliases.some((alias) => category === alias || (alias.length > 4 && category.includes(alias)));
    });
  }, [allTours, slug]);

  const title = slug === "sunandbeach" ? "Beaches and Islands"
    : slug === "hikingandtrekking" ? "Hiking and Nature"
    : slug === "wildsafari" ? "Wildlife and Safaris"
    : slug === "cultural" ? "Culture and Heritage"
    : slug === "special" ? "Food and Local Experiences"
    : slug === "festival" ? "Festivals and Events"
    : "Explore tours";

  return (
    <main className="min-h-screen bg-slate-50">
      <HeroTour />
      <div className="mx-auto max-w-7xl px-4 sm:px-8"><NavigatedMenu /></div>
      <TourNav />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Explore by experience</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-slate-600">Browse available tours in this category, wherever providers have listed them.</p>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)}</div>
        ) : !error && categoryTours.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-950">No tours in this category yet</h2>
            <p className="mt-2 text-slate-600">Tour providers can add listings for any country. Try another category or search by destination.</p>
            <Link to="/tours/home" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Find a destination</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTours.map((tour) => (
              <article key={tour._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={tour.img || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"; }}
                  alt={tour.name || "Tour"}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-xl font-bold text-slate-950">{tour.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{[tour.cities, tour.country].filter(Boolean).join(" · ")}</p>
                  <p className="mt-3 text-sm text-slate-600">{tour.duration} day(s) · Up to {tour.groupCount} travelers</p>
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

export default AllTourCategories;
