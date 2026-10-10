import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsappSquare,
  FaFacebookSquare,
  FaInstagramSquare,
  FaTwitterSquare,
} from "react-icons/fa";

const Footer = () => {
  return (
    <div className="w-full bg-black py-16 px-10 grid md:grid-cols-2 gap-8 text-gray-300 bottom-0">
      <div className="">
        <h3 className="text-2xl font-bold text-[#41A4FF]">Travelco</h3>
        <p className="py-4 max-w-xl leading-7 text-gray-400">
          Discover destinations, compare travel options, save places you love, and keep your travel preferences in one place.
        </p>
        <div className="flex justify-start gap-10 md:w-[75%] my-6">
          <FaWhatsappSquare size={30} />
          <FaFacebookSquare size={30} />
          <FaInstagramSquare size={30} />
          <FaTwitterSquare size={30} />
        </div>
      </div>
      <div className="flex md:justify-around justify-start mt-8">
        <div>
          <h6 className="font-bold text-[#41a3ff]">Reservations</h6>
          <ul className="mt-2 font-light">
            <li className="py-2 text-sm">Hotels</li>
            <li className="py-2 text-sm">Tour Packages</li>
            <li className="py-2 text-sm">Vehicles</li>
            <li className="py-2 text-sm">Restaurants</li>
            <li className="py-2 text-sm">Events</li>
          </ul>
        </div>
        <div className="ml-[8rem]">
          <h6 className="font-bold text-[#41A4FF]">Support</h6>
          <ul className="mt-2 font-light">
            <li className="py-2 text-sm"><Link to="/contactus" className="hover:text-white">Contact us</Link></li>
            <li className="py-2 text-sm"><Link to="/explore" className="hover:text-white">Explore World</Link></li>
            <li className="py-2 text-sm"><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            <li className="py-2 text-sm"><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
