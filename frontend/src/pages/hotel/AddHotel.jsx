import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import countries from "../../data/countries";
import { getPreferredCurrency, supportedCurrencies } from "../../utils/globalTravel";
import { isValidInternationalPhone, isValidPostalCode, isPositiveNumber, isPositiveInteger, isOptionalRating } from "../../utils/formValidation";

export const AddHotel = () => {
  const navigate = useNavigate();
  const [hotelName, setHotelName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [hotelType, setHotelType] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [currency, setCurrency] = React.useState(getPreferredCurrency);
  const [zip, setZip] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [distance, setDistance] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [noOfRoomTypes, setNoOfRoomTypes] = React.useState("");
  const [price, setprice] = React.useState("");
  const [raiting, setRaiting] = React.useState(""); //must be added later
  const [hotelImg, setHotelImg] = React.useState("");

  const [hotelImgs, setHotelImgs] = useState([]);
  const [certificates, setCertificates] = React.useState([]);

  
  
  console.log(hotelImgs);

  
  function sendData(e) {
    e.preventDefault();

    if (!isValidPostalCode(zip)) {
      Swal.fire({ icon: "error", title: "Invalid postal code", text: "Enter a valid postal/ZIP code (2–12 letters or digits; a value of only zeroes is not valid)." });
      return;
    }
    if (!isValidInternationalPhone(contactNumber)) {
      Swal.fire({ icon: "error", title: "Invalid contact number", text: "Enter an international phone number with 7–15 digits; it cannot be all zeroes." });
      return;
    }
    if (!isPositiveNumber(price)) {
      Swal.fire({ icon: "error", title: "Invalid price", text: "Enter a price greater than zero. Decimal prices such as 125.50 are allowed." });
      return;
    }
    if (!isPositiveInteger(noOfRoomTypes)) {
      Swal.fire({ icon: "error", title: "Invalid room count", text: "Number of room types must be a whole number greater than zero." });
      return;
    }
    if (!isOptionalRating(raiting, 5)) {
      Swal.fire({ icon: "error", title: "Invalid rating", text: "Rating must be between 0 and 5. Decimal values such as 4.5 are allowed." });
      return;
    }

    const formData = new FormData();

    formData.append("name", hotelName);
    formData.append("title", title);
    formData.append("type", hotelType);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("currency", currency);
    formData.append("province", province);
    formData.append("zip", zip);
    formData.append("address", address);
    formData.append("distance", distance);
    formData.append("contactName", contactName);
    formData.append("contactNo", contactNumber);
    formData.append("numberOfRoomTypes", noOfRoomTypes);
    formData.append("HotelImg", hotelImg);

    for (let i = 0; i < hotelImgs.length; i++) {
      formData.append("HotelImgs", hotelImgs[i]);
      console.log(i);
    }
    for (let i = 0; i < certificates.length; i++) {
      formData.append("certificates", certificates[i]);
      console.log(i);
    }

    formData.append("description", description);
    formData.append("cheapestPrice", price);
    if (raiting !== "") formData.append("rating", raiting);

    axios
      .post("/hotels", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        Swal.fire({
          position: 'top-start',
          icon: 'success',
          title: 'Hotel added Successfully',
          showConfirmButton: false,
          timer: 2000,
          
        }) 
        navigate("/hotels");
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
        <h1 className="text-2xl font-bold mb-8 mt-8">
          List Your <span class="text-[#41A4FF]">Hotel</span> and{" "}
          <span class="text-[#41A4FF]">Join</span> with us
        </h1>
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
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => setHotelType(e.target.value)}
            >
              <option>--Add hotel type</option>
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
              NUmber of room types
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 borderrounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="noOfRoomTypes"
              type="number"
              min="1"
              step="1"
              required
              onChange={(e) => setNoOfRoomTypes(e.target.value)}
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

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Rating
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              inputMode="decimal"
              placeholder="0–5, e.g. 4.5"
              onChange={(e) => setRaiting(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Upload main hotel image
            </label>
            <input
              type="file"
              name="mainImage"
              id="mainImg"
              class=" bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              onChange={(e) => setHotelImg(e.target.files[0])}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Upload hotel images (upload 5 iamges)
            </label>
            <input
              type="file"
              name="mainImage"
              id="mainImg"
              class=" bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple
              required
              onChange={(e) => {
                const files = e.target.files;
                const images = [];
                for (let i = 0; i < files.length; i++) {
                  images.push(files[i]);
                }
                setHotelImgs(images);
              }}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Provide buissness registration certificate and Hotel license
            </label>
            <input
              type="file"
              name="Certificate"
              id="Certificate"
              class=" bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple
              required
              onChange={(e) => {
                const cfiles = e.target.files;
                const cimages = [];
                for (let i = 0; i < cfiles.length; i++) {
                  cimages.push(cfiles[i]);
                }
                setCertificates(cimages);
              }}
            />
          </div>
        </div>

        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-8">
          SUBMIT
        </button>
        <input class="bg-[#787878] hover:bg-[#474747] text-white font-bold py-2 px-4 rounded-full ml-5
        " type="reset" value="Reset" />
      </form>
    </div>
  );
};

export default AddHotel;
