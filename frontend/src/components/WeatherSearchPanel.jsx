import React, { useState } from "react";
import axios from "axios";

const WeatherSearchPanel = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchWeather = async (event) => {
    event.preventDefault();
    const query = city.trim();
    if (query.length < 2 || query.length > 80) {
      setError("Enter a city name between 2 and 80 characters.");
      return;
    }
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const response = await axios.get("integrations/weather", { params: { city: query } });
      setWeather(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Weather is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Destination weather</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950">Check the weather before you go</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Look up current conditions in a destination city. Weather data is informational and can change quickly.
          </p>
        </div>
        <form onSubmit={searchWeather} className="flex flex-col gap-3 sm:flex-row">
          <label className="min-w-0 flex-1">
            <span className="sr-only">City name</span>
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              maxLength={80}
              placeholder="City or city,country (e.g. Tokyo,JP)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking…" : "Check weather"}
          </button>
        </form>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {weather && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {weather.icon && <img src={"https://openweathermap.org/img/wn/" + weather.icon + "@2x.png"} alt="" width="72" height="72" />}
            <div>
              <h4 className="text-lg font-bold text-slate-950">{weather.city}{weather.countryCode ? ", " + weather.countryCode : ""}</h4>
              <p className="capitalize text-sm text-slate-600">{weather.description}</p>
              {weather.observedAt && <p className="mt-1 text-xs text-slate-500">Observed: {new Date(weather.observedAt).toLocaleString()}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:min-w-[300px]">
            <div><p className="text-xs text-slate-500">Temperature</p><p className="text-2xl font-bold text-slate-950">{weather.temperatureC === null ? "—" : weather.temperatureC + "°C"}</p></div>
            <div><p className="text-xs text-slate-500">Feels like</p><p className="text-xl font-semibold text-slate-900">{weather.feelsLikeC === null ? "—" : weather.feelsLikeC + "°C"}</p></div>
            <div><p className="text-xs text-slate-500">Humidity</p><p className="font-semibold text-slate-900">{weather.humidity === null ? "—" : weather.humidity + "%"}</p></div>
            <div><p className="text-xs text-slate-500">Wind</p><p className="font-semibold text-slate-900">{weather.windSpeedMps === null ? "—" : weather.windSpeedMps + " m/s"}</p></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WeatherSearchPanel;
