import React from "react";
import { useLocation } from "react-router-dom";
import { HotelHero } from "../../components/hotel/HotelHero";
import { HotelSearchBar } from "../../components/hotel/HotelSearchBar";
import HotelCard from "../../components/hotel/HotelCard";
import SearchCard from "../../components/hotel/SearchCard";

export const HotelHome = () => {
  const location = useLocation();
  const state = location.state || {};
  const date = state.date;

  return (
    <main className="min-h-screen">
      <HotelHero />
      <HotelSearchBar />
      {Array.isArray(state.data) && state.data.length > 0 && (
        <section aria-label="Hotel search results" className="mt-8">
          <h1 className="ml-6 text-xl font-bold text-slate-900 sm:ml-10 md:text-2xl">Search results</h1>
          {state.data.map((item) => (
            <SearchCard
              key={item._id}
              name={item.name}
              city={item.city}
              country={item.country}
              currency={item.currency}
              cheapestPrice={item.cheapestPrice}
              HotelImg={item.HotelImg}
              _id={item._id}
              date={date}
            />
          ))}
        </section>
      )}
      <h2 className="ml-6 mt-8 text-xl font-bold text-slate-900 sm:ml-10 md:text-2xl">Hotels guests love</h2>
      <HotelCard />
    </main>
  );
};

export default HotelHome;
