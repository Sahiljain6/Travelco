import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { isPositiveNumber, isPositiveInteger, isNonNegativeNumber } from "../../utils/formValidation";

const DoUpdateTrain = () => {

    const navigate = useNavigate();
    const id = useParams().id;
    const [singleTrain, setSingleTrain] = useState([]);

    useEffect(() => {
        const getOneTrain = () => {
            axios.get(`/train/get/${id}`).then((res) => {
                setSingleTrain(res.data)
                console.log(singleTrain)
            }).catch((err) => {
                console.log(err.message);
            })
        }
        getOneTrain();
    }, [id])

    const handleChanges = (event) => {
        const {name , value} = event.target;
        setSingleTrain((preTrain) =>({
            ...preTrain,
            [name] : value,
        }))

        console.log(singleTrain);
    };

    const handleFormSubmit = (event) =>{
        event.preventDefault();

        if (!isPositiveNumber(singleTrain.price)) {
            Swal.fire("Invalid fare", "Enter a fare greater than zero. Decimal values such as 45.75 are allowed.", "error");
            return;
        }
        if (!isPositiveInteger(singleTrain.noOfSeats)) {
            Swal.fire("Invalid seat count", "Number of seats must be a whole number greater than zero.", "error");
            return;
        }
        if (singleTrain.MaxBagage !== "" && !isNonNegativeNumber(singleTrain.MaxBagage)) {
            Swal.fire("Invalid baggage weight", "Baggage weight must be zero or greater; decimal values are allowed.", "error");
            return;
        }
        if (singleTrain.cancelCharges !== "" && !isNonNegativeNumber(singleTrain.cancelCharges)) {
            Swal.fire("Invalid cancellation charge", "Cancellation charges must be zero or greater. Decimal values are allowed.", "error");
            return;
        }

        axios.
            put(`/train/update/${id}`, { ...singleTrain, price: Number(singleTrain.price), noOfSeats: Number(singleTrain.noOfSeats), MaxBagage: singleTrain.MaxBagage === "" ? "" : Number(singleTrain.MaxBagage), cancelCharges: singleTrain.cancelCharges === "" ? "" : Number(singleTrain.cancelCharges) })
            .then(() => {
                Swal.fire({
                  title: "Do you want to save the changes?",
                  showDenyButton: true,
                  showCancelButton: true,
                  confirmButtonText: "Save",
                  denyButtonText: `Don't save`,
                }).then((result) => {
                  if (result.isConfirmed) {
                    Swal.fire("Saved!", "", "success");
                    navigate("/adminTrain")
                  } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                  }
                });
              })
              .catch((err) => Swal.fire("Not Updated", err.message, "error"));
    };
    

    return (
        <div>
            <h1 className='uppercase text-center py-16 text-2xl md:text-3xl font-bold'>Add New Train</h1>

            <div className="bg-[#DEEFFF]">
                <div className="py-10 lg:py-20 px-16 lg:px-96 md:px-64 flex flex-col text-center">

                    <form>

                        <div className="relative mb-3 mt-5" >
                            <input
                                type="text"
                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="trainName"
                                name = "trainName"
                                value={singleTrain.trainName}
                                onChange={handleChanges}
                                placeholder="Train Name"
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="text"
                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="from"
                                name="from"
                                placeholder="from"
                                value={singleTrain.from}
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="text"
                                className="bordder-[#E9EDF4] w-full  rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="to"
                                name="to"
                                placeholder="To"
                                value={singleTrain.to}
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="time"
                                className="bordder-[#E9EDF4] w-full  rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="depatureTime"
                                name="depatureTime"
                                value= {singleTrain.depatureTime}
                                placeholder="Depature Time"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="time"
                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="arrivalTime"
                                name="arrivalTime"
                                value={singleTrain.arrivalTime}
                                placeholder="Depature Time"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="date"
                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="date"
                                name="date"
                                value={singleTrain.data}
                                placeholder="Arrival Time"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                inputMode="decimal"
                                value={singleTrain.price ?? ""}
                                placeholder="Fare, e.g. 45.75"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="noOfSeats"
                                name="noOfSeats"
                                type="number"
                                min="1"
                                step="1"
                                value={singleTrain.noOfSeats ?? ""}
                                placeholder="Number of seats"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="text"
                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="description"
                                name="description"
                                value={singleTrain.description}
                                placeholder="Description"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="MaxBagage"
                                name="MaxBagage"
                                type="number"
                                min="0"
                                step="0.1"
                                inputMode="decimal"
                                placeholder="Max baggage weight"
                                value={singleTrain.MaxBagage}
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                type="text"
                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="classType"
                                name="classType"
                                value={singleTrain.classType}
                                placeholder="Class Type"
                                onChange={handleChanges}
                            />
                        </div>

                        <div className="relative mb-3 mt-5">
                            <input
                                                                className="bordder-[#E9EDF4] w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                                id="cancelCharges"
                                name="cancelCharges"
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="Cancellation charges"
                                value={singleTrain.cancelCharges}
                                onChange={handleChanges}
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-6 inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                            data-te-ripple-init
                            data-te-ripple-color="light"
                            onClick={handleFormSubmit}
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default DoUpdateTrain;