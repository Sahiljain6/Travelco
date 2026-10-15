import React from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { path: "/tours/home", display: "Explore destinations" },
  { path: "/sunandbeach", display: "Beaches & Islands" },
  { path: "/hikingandtrekking", display: "Hiking & Nature" },
  { path: "/wildsafari", display: "Wildlife" },
  { path: "/cultural", display: "Culture & Heritage" },
  { path: "/special", display: "Local Experiences" },
  { path: "/festival", display: "Festivals" },
];

const TourNav = () => (
  <nav aria-label="Tour categories" className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-1 px-3 py-3 sm:gap-2 sm:px-6">
      {navLinks.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 sm:px-4"
        >
          {item.display}
        </Link>
      ))}
    </div>
  </nav>
);

export default TourNav;
