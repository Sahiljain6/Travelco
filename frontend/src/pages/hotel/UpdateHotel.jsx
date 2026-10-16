import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import countries from "../../data/countries";
import { getPreferredCurrency, supportedCurrencies } from "../../utils/globalTravel";
import { isValidInternationalPhone, isValidPostalCode, isPositiveNumber, isOptionalRating } from "../../utils/formValidation";


export const UpdateHotel= () => {

    const navigate = useNavigate();
const location=useLocation();
    const id= location.pathname.split("/")[3];
    
    const {data, loading,error }=useFetch(`/hotels/find/${id}`)

  const [name, setHotelName] = React.useState(data.name);
  const [title, setTitle] = React.useState(data.title);
  const [type, setHotelType] = React.useState(data.type);
  const [city, setCity] = React.useState(data.city || "");
  const [country, setCountry] = React.useState(data.country || "");
  const [province, setProvince] = React.useState(data.province || "");
  const [currency, setCurrency] = React.useState(data.currency || getPreferredCurrency());
  const [zip, setZip] = React.useState(data.zip);
  const [address, setAddress] = React.useState(data.address);
  const [distance, setDistance] = React.useState(data.distance);
  const [description, setDescription] = React.useState(data.description);
  const [contactName, setContactName] = React.useState(data.contactName);
  const [contactNo, setContactNumber] = React.useState(data.contactNo || "");
 // const [noOfRoomTypes, setNoOfRoomTypes] = React.useState("");
  const [cheapestPrice, setprice] = React.useState(data.cheapestPrice ?? "");
  const [rating, setRating] = React.useState(data.rating ?? "");

  

  

  

  useEffect(() => {
    if (!data || !data._id) return;
    setHotelName(data.name || "");
    setTitle(data.title || "");
    setHotelType(data.type || "");
    setCity(data.city || "");
    setCountry(data.country || "");
    setProvince(data.province || "");
    setZip(data.zip || "");
    setAddress(data.address || "");
    setDistance(data.distance || "");
    setDescription(data.description || "");
    setContactName(data.contactName || "");
    setContactNumber(data.contactNo || "");
    setprice(data.cheapestPrice ?? "");
    setRating(data.rating ?? "");
    setCurrency(data.currency || getPreferredCurrency());
  }, [data]);

  function sendData(e) {
    e.preventDefault();

    

    if (!isValidPostalCode(zip)) {
      Swal.fire({ icon: "error", title: "Invalid postal code", text: "Enter a valid postal/ZIP code (2–12 letters or digits; a value of only zeroes is not valid)." });
      return;
    }
    if (!isValidInternationalPhone(contactNo)) {
      Swal.fire({ icon: "error", title: "Invalid contact number", text: "Enter an international phone number with 7–15 digits; it cannot be all zeroes." });
      return;
    }
    if (!isPositiveNumber(cheapestPrice)) {
      Swal.fire({ icon: "error", title: "Invalid price", text: "Enter a price greater than zero. Decimal prices such as 125.50 are allowed." });
      return;
    }
    if (rating !== "" && (!isOptionalRating(rating, 5) || Number(rating) < 1)) {
      Swal.fire({ icon: "error", title: "Invalid rating", text: "Rating must be between 1 and 5. Decimal values such as 4.5 are allowed." });
      return;
    }

    const updateHotel = {
        name,
        title,
        type,
        city,
        country,
        currency,
        province,
        zip: String(zip).trim(),
        address,
        distance,
        description,
        contactName,
        contactNo: String(contactNo).trim(),
        cheapestPrice: Number(cheapestPrice)
      };
    if (rating !== "") updateHotel.rating = Number(rating);

    axios
      .put(`/hotels/${id}`,updateHotel) 
      .then(() => {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Your Hotel updated Successfully',
          showConfirmButton: false,
          timer: 2000
        }) 
        navigate(`/hotels`)

      })
      .catch((err) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: err 
          })

      });
  }

  return (
    <div className="flex justify-center">
      <form
        class="w-full max-w-lg"
        onSubmit={sendData}
        encType="multipart/form-data"
      >
        <h1 className="text-2xl font-bold mb-8 mt-8">Update <span class='text-[#41A4FF]'>Hotel</span> and <span class='text-[#41A4FF]'>Join</span> with us</h1>
        <div class="flex flex-wrap -mx-3 mb-3">
          <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Hotel name
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="hotelName"
              defaultValue={data.name}
              type="text"
              placeholder="Enter your Hotel name"
              required
              onChange={(e) => setHotelName(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 ">
          <div class="w-full  px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Title
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="hotelName"
              defaultValue={data.title}
              type="text"
              placeholder="Enter title for your Hotel"
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full md:w-1/2 px-3  md:mb-0">
            <label
              for="HotelType"
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            >
              Select your Hotel Type
            </label>
            <select
              id="hotelType"
              defaultValue={data.type}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) =>setHotelType(e.target.value)}
            >
              <option>Hotel</option>
              <option>Apartment</option>
              <option>Resort</option>
              <option>Villa</option>
              <option>Cabin</option>
            </select>
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-city"
            >
              City
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="city"
              defaultValue={data.city}
              type="text"
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="country">Country</label>
            <select id="country" class="block w-full rounded border bg-gray-200 px-4 py-3" value={country} onChange={(e) => setCountry(e.target.value)} required>
              <option value="">Choose a country</option>
              {countries.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="province">State / region</label>
            <input id="province" type="text" class="block w-full rounded border bg-gray-200 px-4 py-3" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="State, province or region" />
          </div>
          <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-zip"
            >
              Zip
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="zip"
              value={zip || ""}
              type="text"
              inputMode="text"
              minLength={2}
              maxLength={12}
              autoComplete="postal-code"
              placeholder="e.g. 90210 or SW1A 1AA"
              required
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Address
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="address"
              defaultValue={data.address}
              type="text"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Distance from main city
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="distance"
              defaultValue={data.distance}
              type="text"
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Contact Name
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="contactName"
              defaultValue={data.contactName}
              type="text"
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Contact Number
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="contactNumber"
              value={contactNo || ""}
              type="tel"
              inputMode="tel"
              minLength={7}
              maxLength={25}
              autoComplete="tel"
              placeholder="+1 212 555 0100"
              required
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>
        </div>


        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Description
            </label>
            <textarea
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="desc"
              defaultValue={data.description}
              type="String"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              cheapest price
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="price"
              value={cheapestPrice}
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
              placeholder="e.g. 125.50"
              onChange={(e) => setprice(e.target.value)}
            />
            <label class="mt-4 block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="currency">Listing currency</label>
            <select id="currency" class="block w-full rounded border bg-gray-200 px-4 py-3" value={currency} onChange={(e) => setCurrency(e.target.value)} required>
              {supportedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="rating">
              Rating (optional, 1–5)
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              inputMode="decimal"
              value={rating}
              placeholder="e.g. 4.5"
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
        </div>



    
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-8">
          Update
        </button>
      </form>
    </div>
  );
};

export default UpdateHotel;