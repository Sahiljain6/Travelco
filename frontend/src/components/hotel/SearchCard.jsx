import { Link, useNavigate } from "react-router-dom";
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
  if (/^https?:\\/\\//i.test(image)) return image;
  const configuredBase = BASE_URL.replace(/\\/+$/, "");
  const apiBase = configuredBase.endsWith("/api") ? configuredBase : `${configuredBase}/api`;
  return `${apiBase}/hotels/images/${image}`;
};

const SearchCard = (item) => {
  const navigate = useNavigate();
  const date = item.date?.checkInDate && item.date?.checkOutDate ? item.date : createDefaultStay();
  const handleView = () => navigate(`/hotel/${item._id}`, { state: date });

  return (
    <article className="mx-auto w-full max-w-7xl px-4 py-4 md:px-8 lg:px-16 xl:px-20">
      <div className="grid grid-cols-1 gap-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:grid-cols-[260px_1fr]">
        <img
          src={hotelImageUrl(item.HotelImg)}
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }}
          alt={item.name ? `${item.name} hotel` : "Hotel"}
          loading="lazy"
          className="h-56 w-full object-cover sm:h-full sm:min-h-56"
        />
        <div className="flex flex-col justify-center p-5">
          <h2 className="text-xl font-bold text-slate-900">{item.name || "Hotel"}</h2>
          <p className="mt-2 text-sm text-slate-500">{[item.city, item.country].filter(Boolean).join(", ")}</p>
          <p className="mt-3 font-semibold text-slate-900">Starting from {formatMoney(item.cheapestPrice, item.currency || "USD")} <span className="text-xs font-normal text-slate-500">/ night</span></p>
          <p className="mt-2 text-xs text-slate-500">Selected stay: {date.checkInDate} – {date.checkOutDate}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleView} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">View details</button>
            <Link to={`/hotel/${item._id}`} state={date} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Book now</Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SearchCard;
