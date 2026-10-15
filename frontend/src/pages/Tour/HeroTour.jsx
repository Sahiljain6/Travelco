import React from "react";
import SearchBar from "./SearchBar";

const HERO_IMAGE = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85";

const HeroTour = () => {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      <img
        src={HERO_IMAGE}
        alt="Mountain scenery inspiring worldwide travel"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-950/30" />
      <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-4 py-16 sm:px-8 lg:px-12">
        <div className="max-w-4xl text-white">
          <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] backdrop-blur">
            One world. Countless ways to explore.
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Do more with Travelco.
            <span className="mt-2 block text-sky-300">Go beyond the familiar.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-xl sm:leading-8">
            Discover tours across cities, coastlines, mountains and cultures. Search by destination, trip length and group size to find an adventure that fits.
          </p>
        </div>
        <div className="mt-10 max-w-5xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default HeroTour;
