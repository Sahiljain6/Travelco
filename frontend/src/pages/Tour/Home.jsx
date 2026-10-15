import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import HeroTour from "./HeroTour";
import HiddenPlaces from "./HiddenPlaces";
import ServiceCard from "./Services/ServiceCard";
import TourCategories from "./Services/ServiceCategories";
import TourNav from "../../components/navbar/TourNav";
import CustomForm from "./Services/CustomForm";

const Home = () => (
  <main className="min-h-screen bg-white">
    <HeroTour />

    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <li><Link to="/" className="text-blue-700 hover:underline">Home</Link></li>
        <li aria-hidden="true"><AiOutlineRight /></li>
        <li><Link to="/tours/home" className="text-blue-700 hover:underline">Tour packages</Link></li>
        <li aria-hidden="true"><AiOutlineRight /></li>
        <li aria-current="page">Explore destinations worldwide</li>
      </ol>
    </nav>

    <TourNav />

    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Choose your kind of journey</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Explore the world by experience</h2>
        <p className="mt-3 leading-7 text-slate-600">From coastlines and mountain trails to cultural landmarks, browse a style of travel and search for tours in the destination you have in mind.</p>
      </div>
      <TourCategories />
    </section>

    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Currently listed on Travelco</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Tour packages to explore</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500">Listings depend on what tour providers have published. Use the search above for a city or country.</p>
      </div>
      <div className="mt-6"><ServiceCard /></div>
    </section>

    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Plan it your way</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Need something more personal?</h2>
        <p className="mt-4 leading-7 text-slate-600">Tell us what kind of trip you want, where you would like to go, and what matters to your group.</p>
      </div>
      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-8"><CustomForm /></div>
    </section>

    <div className="pt-12"><HiddenPlaces /></div>
  </main>
);

export default Home;
