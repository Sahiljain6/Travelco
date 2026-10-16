import axios from "axios";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { isPositiveNumber, isPositiveInteger } from "../../utils/formValidation";

export const AddRoom = () => {
  const location = useLocation();
  const hotelID = location.pathname.split("/")[3];

  const [title, setRoomName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [roomNumbers, setRoomNumbers] = useState([]);

  console.log({ hotelID });

  function sendData(e) {
    e.preventDefault();

    if (!isPositiveNumber(price)) {
      Swal.fire({ icon: "error", title: "Invalid room price", text: "Enter a room price greater than zero. Decimal values such as 99.50 are allowed." });
      return;
    }
    if (!isPositiveInteger(maxPeople)) {
      Swal.fire({ icon: "error", title: "Invalid capacity", text: "Maximum people must be a whole number greater than zero." });
      return;
    }
    if (!roomNumbers.length || roomNumbers.some((number) => !isPositiveInteger(number))) {
      Swal.fire({ icon: "error", title: "Invalid room numbers", text: "Enter one or more positive whole-number room numbers." });
      return;
    }

    const roomNumbersArray = roomNumbers.map((num) => ({ number: Number(num) }));
    const newRoom = {
      title,
      price,
      description,
      maxPeople,
      roomNumbers: roomNumbersArray,
    };

    axios
      .post(`/rooms/${hotelID}`, newRoom)

      .then(() => {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Room added Successfully',
          showConfirmButton: false,
          timer: 2000
        }) 
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
        id="createRoom"
        encType="multipart/form-data"
      >
        <h1 className="text-2xl font-bold mb-8 mt-5">Customize Your <span class='text-[#41A4FF]'>Rooms</span></h1>
        <div class="flex flex-wrap -mx-3 mb-3">
          <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Name of the room
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="hotelName"
              type="text"
              required
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 ">
          <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Price
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="roomPrice"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 99.50"
              required
              onChange={(e) => setPrice(e.target.value)}
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
              Max people
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 borderrounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="maxPeople"
              type="number"
              min="1"
              step="1"
              required
              onChange={(e) => setMaxPeople(e.target.value)}
            />
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label
              class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Room numbers
            </label>
            <input
              class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="roomNumbers"
              type="text"
              onChange={(e) => {
                const inputVal = e.target.value;
                const roomNumbers = inputVal
                  .split(",")
                  .map((num) => parseInt(num.trim()));
                setRoomNumbers(roomNumbers);
              }}
            />
          </div>
        </div>

       <div className="mb-5">
          <button class="bg-[#41A4FF] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full " >
          SUBMIT
        </button>
        <input class="bg-[#787878] hover:bg-[#474747] text-white font-bold py-2 px-4 rounded-full ml-5 
        " type="reset" value="Reset" />
       </div>
      </form>
    </div>
  );
};
