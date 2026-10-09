import React from "react";
import { FaHotel, FaTrain } from "react-icons/fa";
import { MdTour } from "react-icons/md";
import { AiFillCar } from "react-icons/ai";
import { BiRestaurant } from "react-icons/bi";
import { BsCalendarEvent } from "react-icons/bs";

const categories = [
  {
    name: "Hotel Reservation",
    icon: <FaHotel />,
  },
  {
    name: "Tour Package Reservation",
    icon: <MdTour />,
  },
  {
    name: "Vehicle Reservation",
    icon: <AiFillCar />,
  },
  {
    name: "Train Reservation",
    icon: <FaTrain />,
  },
  {
    name: "Restaurant Reservation",
    icon: <BiRestaurant />,
  },
  {
    name: "Event Reservation",
    icon: <BsCalendarEvent />,
  },
];
const Services = () => {
  return (
    <>
      <div
        id="services"
        className="bg-gradient-to-b from-white to-orange-50 px-5 py-12 lg:px-24 lg:py-20"
      >
        <div class="container mx-auto">
          <div class="-mx-4 flex flex-wrap">
            <div class="w-full px-4">
              <div class="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
                <span class="mb-2 block text-lg font-bold text-orange-500">
                  Your Journey Starts Here
                </span>
                <h2 class="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-[40px]">
                  Everything You Need to Travel
                </h2>
                <p class="text-base leading-7 text-slate-600">
                  From finding the perfect stay to arranging transport and
                  planning activities, explore travel services designed to
                  make your journey more convenient. Discover available options
                  and bring every part of your trip together in one place.
                </p>
              </div>
            </div>
          </div>
          <div className="-mx-4 grid gap-6 lg:grid-cols-3">
            {categories.map((category, index) => {
              const colors = [
                "bg-blue-100 text-blue-700",
                "bg-orange-100 text-orange-700",
                "bg-emerald-100 text-emerald-700",
                "bg-violet-100 text-violet-700",
                "bg-pink-100 text-pink-700",
                "bg-amber-100 text-amber-700",
              ];

              return (
                <div
                  key={category.name}
                  className="group mb-4 grid grid-cols-[70px_1fr] items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:p-7"
                >
                  <div
                    className={`flex h-[70px] w-[70px] items-center justify-center rounded-2xl text-3xl transition group-hover:scale-105 ${colors[index % colors.length]}`}
                  >
                    {category.icon}
                  </div>

                  <h4 className="text-lg font-bold text-slate-800">
                    {category.name}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
