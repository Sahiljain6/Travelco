import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { formatMoney } from "../../utils/globalTravel";
import { BASE_URL } from "../../utils/config";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const toLocalDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDefaultStay = () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);
  return { checkInDate: toLocalDateInput(checkIn), checkOutDate: toLocalDateInput(checkOut) };
};

const hotelImageUrl = (image) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  let configuredBase = BASE_URL;
  while (configuredBase.endsWith("/")) configuredBase = configuredBase.slice(0, -1);
  const apiBase = configuredBase.endsWith("/api") ? configuredBase : `${configuredBase}/api`;
  return `${apiBase}/hotels/images/${image}`;
};

const HotelOverview = () => {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    axios.get(`/hotels/find/${id}`)
      .then((response) => {
        if (active && response.data) setData(response.data);
        else if (active) setLoadError("This hotel is no longer available.");
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || "Unable to load this hotel.");
      });
    return () => { active = false; };
  }, [id]);

  const bookNow = () => navigate(`/hotel/${id}`, { state: createDefaultStay() });

  if (loadError) return <main className="mx-auto max-w-3xl px-4 py-16 text-red-700">{loadError}</main>;
  if (!data) return <main className="mx-auto max-w-6xl px-4 py-16 text-slate-600">Loading hotel details…</main>;

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <img src={hotelImageUrl(data.HotelImg)} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }} alt={data.name ? `${data.name} hotel` : "Hotel"} className="max-h-[560px] w-full rounded-2xl object-cover shadow-sm" />
            {Array.isArray(data.HotelImgs) && data.HotelImgs.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.HotelImgs.map((image, index) => <img key={image || index} src={hotelImageUrl(image)} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }} alt={`${data.name || "Hotel"} photo ${index + 1}`} loading="lazy" className="h-36 w-full rounded-xl object-cover" />)}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">{data.type || "Accommodation"}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">{data.name}</h1>
            <p className="mt-2 text-slate-600">{[data.city, data.country].filter(Boolean).join(", ")}</p>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">{data.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{data.description}</p>
            {data.distance && <p className="mt-4 text-sm text-slate-500">Approximately {data.distance} from the city centre.</p>}
            <div className="mt-6">
              <p className="text-2xl font-bold text-slate-950">{formatMoney(data.cheapestPrice, data.currency || "USD")} <span className="text-sm font-normal text-slate-500">/ night</span></p>
              <p className="mt-2 text-sm text-slate-500">Prices are estimates until the room and stay dates are confirmed.</p>
            </div>
            <button type="button" onClick={bookNow} className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700">Book now</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HotelOverview;
