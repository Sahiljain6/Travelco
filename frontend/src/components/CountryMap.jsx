import React, { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const getCoordinates = (country) => {
  const coordinates = country && country.latlng;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const latitude = Number(coordinates[0]);
  const longitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return [latitude, longitude];
};

const MapViewport = ({ country }) => {
  const map = useMap();
  useEffect(() => {
    const coordinates = getCoordinates(country);
    if (coordinates) map.flyTo(coordinates, 4, { duration: 0.8 });
  }, [country, map]);
  return null;
};

const CountryMap = ({ countries = [], selectedCountry = null, onSelectCountry = () => {} }) => {
  const mapTilerKey = process.env.REACT_APP_MAPTILER_API_KEY;
  const tileUrl = mapTilerKey
    ? "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=" + encodeURIComponent(mapTilerKey)
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = mapTilerKey
    ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

  const mappedCountries = countries
    .map((country) => ({ country, coordinates: getCoordinates(country) }))
    .filter((item) => item.coordinates);

  return (
    <div className="relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom={false}
        style={{ height: "420px", width: "100%", zIndex: 0 }}
        aria-label="Interactive map of world destinations"
      >
        <TileLayer url={tileUrl} attribution={attribution} maxZoom={19} />
        <MapViewport country={selectedCountry} />
        {mappedCountries.map(({ country, coordinates }) => {
          const selected = selectedCountry && selectedCountry.cca2 === country.cca2;
          return (
            <CircleMarker
              key={country.cca2}
              center={coordinates}
              radius={selected ? 8 : 5}
              pathOptions={{
                color: selected ? "#c2410c" : "#1d4ed8",
                fillColor: selected ? "#fb923c" : "#60a5fa",
                fillOpacity: 0.75,
                weight: selected ? 3 : 1,
              }}
              eventHandlers={{ click: () => onSelectCountry(country) }}
            >
              <Popup>
                <div>
                  <strong>{country.name.common}</strong>
                  <div>{country.capital && country.capital[0] ? country.capital[0] : "Capital not listed"}</div>
                  <button
                    type="button"
                    className="mt-2 rounded bg-blue-700 px-3 py-1 text-sm font-semibold text-white"
                    onClick={() => onSelectCountry(country)}
                  >
                    Select destination
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {!mapTilerKey && (
        <p className="border-t border-slate-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-900">
          Development map tiles are using OpenStreetMap. Configure a domain-restricted REACT_APP_MAPTILER_API_KEY in Netlify before production traffic grows.
        </p>
      )}
    </div>
  );
};

export default CountryMap;
