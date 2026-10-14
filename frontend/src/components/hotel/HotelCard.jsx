import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { formatMoney } from "../../utils/globalTravel";
import { BASE_URL } from "../../utils/config";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80";

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

const HotelCard = () => {
  const { data, loading, error } = useFetch("/hotels");
  const hotels = Array.isArray(data) ? data : [];

  if (loading) return <p className="px-8 py-10 text-slate-500">Loading hotels…</p>;
  if (error) return <p role="alert" className="px-8 py-10 text-red-700">Could not load hotels. Please refresh to try again.</p>;
  if (hotels.length === 0) return <p className="px-8 py-10 text-slate-500">No approved hotels are listed yet.</p>;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-16 xl:px-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hotels.map((item) => (
          <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={item._id}>
            <img
              src={hotelImageUrl(item.HotelImg)}
              onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
              alt={item.name ? `${item.name} hotel` : "Hotel"}
              loading="lazy"
              className="h-56 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="mb-2 text-lg font-bold text-slate-900">{item.name || "Hotel"}</h2>
              <p className="mb-3 text-sm text-slate-500">{[item.city, item.country].filter(Boolean).join(", ") || "Location not provided"}</p>
              <p className="mb-4 font-semibold text-slate-900">Starting from {formatMoney(item.cheapestPrice, item.currency || "USD")} <span className="text-xs font-normal text-slate-500">/ night</span></p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/hotelOverview/${item._id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">View details</Link>
                <Link to={`/hotel/${item._id}`} state={createDefaultStay()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">Book now</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HotelCard;
