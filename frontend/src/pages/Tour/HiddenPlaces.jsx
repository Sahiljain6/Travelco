import React from "react";
import { Link } from "react-router-dom";

const destinations = [
  {
    name: "Kyoto, Japan",
    description: "Temples, traditional streets, gardens and seasonal blossoms.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    query: "Kyoto",
  },
  {
    name: "Swiss Alps, Switzerland",
    description: "Mountain trails, alpine villages and dramatic scenery.",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
    query: "Switzerland",
  },
  {
    name: "Cape Town, South Africa",
    description: "Coastal drives, rugged peaks and rich local culture.",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    query: "Cape Town",
  },
  {
    name: "Bali, Indonesia",
    description: "Island landscapes, food, heritage and outdoor adventures.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    query: "Bali",
  },
];

const HiddenPlaces = () => (
  <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Travel inspiration</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">The world is full of places worth discovering.</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Use these ideas to start planning. Tour availability depends on the listings currently published on Travelco.
      </p>
    </div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {destinations.map((destination) => (
        <article key={destination.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <img src={destination.image} alt={destination.name} loading="lazy" className="h-48 w-full object-cover" />
          <div className="p-5">
            <h3 className="text-lg font-bold text-slate-950">{destination.name}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{destination.description}</p>
            <Link to={`/tours/search?destination=${encodeURIComponent(destination.query)}`} className="mt-4 inline-flex font-semibold text-blue-700 hover:underline">
              Find tours <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default HiddenPlaces;
