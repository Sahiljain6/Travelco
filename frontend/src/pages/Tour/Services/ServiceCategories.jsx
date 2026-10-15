import React from "react";
import { Link } from "react-router-dom";
import tourCategories from "../../../assets/data/tourCategoris";

const ServiceCategories = () => (
  <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {tourCategories.map((category) => (
      <Link
        to={`/${category.links}`}
        key={category.id}
        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="overflow-hidden">
          <img
            src={category.photo}
            alt={category.imageAlt || category.title}
            loading="lazy"
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex items-center justify-between p-5">
          <h3 className="text-lg font-bold text-slate-900">{category.title}</h3>
          <span aria-hidden="true" className="text-xl font-bold text-blue-700">→</span>
        </div>
      </Link>
    ))}
  </div>
);

export default ServiceCategories;
