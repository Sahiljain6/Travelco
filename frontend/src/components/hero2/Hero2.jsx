import React from "react";

const Hero2 = () => {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-white to-blue-50 px-6 py-12 md:px-16 md:py-20 lg:px-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col items-start">
          <span className="mb-5 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold tracking-wide text-orange-700">
            LESS SCROLLING. MORE EXPLORING.
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            The World Is
            <span className="block text-orange-500">
              Your Playground.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Find extraordinary places, plan your next adventure,
            and make every journey unforgettable.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/tours/home"
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Explore Destinations ↗
            </a>

            <a
              href="#services"
              className="rounded-xl border-2 border-emerald-600 px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              Find Your Adventure
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-lg bg-blue-100 px-4 py-2 text-blue-800">
              Discover
            </span>
            <span className="rounded-lg bg-orange-100 px-4 py-2 text-orange-800">
              Experience
            </span>
            <span className="rounded-lg bg-emerald-100 px-4 py-2 text-emerald-800">
              Explore
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rotate-2 rounded-[2rem] bg-gradient-to-br from-orange-300 via-pink-300 to-blue-300 opacity-70" />
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80"
            alt="Beautiful lake and mountain scenery for an adventure trip"
            fetchPriority="high"
            className="relative h-[320px] w-full rounded-[1.75rem] object-cover shadow-2xl md:h-[480px]"
          />
          <div className="absolute bottom-5 left-5 rounded-xl bg-white/95 px-4 py-3 shadow-lg">
            <p className="text-sm font-bold text-slate-900">
              Your next story starts here
            </p>
            <p className="text-xs text-slate-600">
              Dream it. Plan it. Explore it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero2;
