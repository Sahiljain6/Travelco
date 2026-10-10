import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,cca2,flags,capital,region,subregion,currencies,population";
const CURRENCIES_API = "https://api.frankfurter.dev/v2/currencies";

const asCurrencyName = (country) => {
  const first = Object.entries(country.currencies || {})[0];
  return first ? `${first[0]} · ${first[1].name || first[0]}` : "Currency unavailable";
};
const populationLabel = (population) => {
  if (!Number.isFinite(population)) return "Population unavailable";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(population);
};

const ExploreWorld = () => {
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All regions");
  const [currencies, setCurrencies] = useState({});
  const [amount, setAmount] = useState("1");
  const [base, setBase] = useState("USD");
  const [quote, setQuote] = useState("INR");
  const [rate, setRate] = useState(null);
  const [rateDate, setRateDate] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(COUNTRIES_API, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("The destination directory is temporarily unavailable.");
        return response.json();
      })
      .then((data) => {
        const sorted = data.filter((country) => country.name?.common && country.cca2)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
        setCountriesError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCountriesError(error.message || "Unable to load countries right now.");
      })
      .finally(() => setCountriesLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(CURRENCIES_API, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Currency list unavailable");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCurrencies(Object.fromEntries(data.filter((item) => item.iso_code).map((item) => [item.iso_code, item.name || item.iso_code])));
        } else {
          setCurrencies(data && typeof data === "object" ? data : {});
        }
      })
      .catch(() => setCurrencies({}));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (base === quote) {
      setRate(1);
      setRateDate("");
      setRateError("");
      setRateLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setRateLoading(true);
      setRateError("");
      fetch(`https://api.frankfurter.dev/v2/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("This currency pair is not supported by the rate provider.");
          return response.json();
        })
        .then((data) => {
          if (!Number.isFinite(Number(data.rate))) throw new Error("A valid reference rate was not returned.");
          setRate(Number(data.rate));
          setRateDate(data.date || "");
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setRate(null);
            setRateDate("");
            setRateError(error.message || "Unable to load a reference rate.");
          }
        })
        .finally(() => setRateLoading(false));
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [base, quote]);

  const regions = useMemo(() => ["All regions", ...new Set(countries.map((item) => item.region).filter(Boolean).sort())], [countries]);
  const visibleCountries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return countries.filter((country) => {
      const currencyText = Object.entries(country.currencies || {}).map(([code, item]) => `${code} ${item.name || ""} ${item.symbol || ""}`).join(" ");
      const matchesSearch = !term || [
        country.name?.common, country.name?.official, country.capital?.join(" "),
        country.region, country.subregion, country.cca2, currencyText
      ].some((value) => String(value || "").toLowerCase().includes(term));
      return matchesSearch && (region === "All regions" || country.region === region);
    });
  }, [countries, search, region]);

  const numericAmount = Number(amount);
  const converted = Number.isFinite(numericAmount) && numericAmount >= 0 && rate !== null ? numericAmount * rate : null;
  const currencyOptions = Object.keys(currencies).length
    ? Object.entries(currencies).map(([code, name]) => ({ code, label: `${code} — ${name}` })).sort((a, b) => a.code.localeCompare(b.code))
    : ["AUD","CAD","CHF","CNY","EUR","GBP","INR","JPY","NZD","SGD","USD","ZAR"].map((code) => ({ code, label: code }));

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-300">Your next story starts here</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Explore the world, your way.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Discover countries, get a quick sense of local regions and currencies, and start saving ideas for your next trip.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#destination-directory" className="rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 hover:bg-sky-300">Explore destinations</a>
              <Link to="/profile" className="rounded-xl border border-white/30 px-5 py-3 font-semibold hover:bg-white/10">Personalize your profile</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
            <p className="text-sm font-semibold text-sky-300">CURRENCY QUICK CONVERTER</p>
            <h2 className="mt-2 text-2xl font-bold">Plan in your preferred currency</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Indicative reference rates, not a quote from your bank or card provider.</p>
            <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="amount">Amount</label>
            <input id="amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-300">From
                <select value={base} onChange={(event) => setBase(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-3 text-white">
                  {currencyOptions.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
                </select>
              </label>
              <label className="text-sm text-slate-300">To
                <select value={quote} onChange={(event) => setQuote(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-3 text-white">
                  {currencyOptions.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 rounded-2xl bg-white p-5 text-slate-950">
              <p className="text-sm text-slate-500">Estimated conversion</p>
              {rateLoading ? <p className="mt-2 text-xl font-semibold">Loading rate…</p> :
                rateError ? <p className="mt-2 text-sm text-rose-600">{rateError}</p> :
                  converted === null ? <p className="mt-2 text-sm text-slate-500">Enter a valid amount to calculate.</p> :
                    <p className="mt-1 break-words text-3xl font-bold">{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(converted)} <span className="text-lg">{quote}</span></p>}
              {rate !== null && base !== quote && !rateLoading && <p className="mt-2 text-xs text-slate-500">1 {base} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {quote}{rateDate ? ` · Rate date: ${rateDate}` : ""}</p>}
            </div>
          </div>
        </div>
      </section>

      <section id="destination-directory" className="mx-auto max-w-7xl px-4 pt-14 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Destination directory</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Find a place that fits you</h2>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">Search countries, capitals, regions, and currency codes to narrow down your options.</p>
          </div>
          <p className="text-sm font-semibold text-slate-500">{countriesLoading ? "Loading countries…" : `${visibleCountries.length.toLocaleString()} destinations`}</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="sr-only">Search destinations</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search country, capital, region or currency…" className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block">
            <span className="sr-only">Filter by region</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              {regions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {countriesError && <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{countriesError} Check your connection and refresh to retry.</div>}
        {countriesLoading ? (
          <div className="grid gap-5 pt-8 sm:grid-cols-2 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-3xl bg-slate-200" /><div className="h-64 animate-pulse rounded-3xl bg-slate-200" /><div className="h-64 animate-pulse rounded-3xl bg-slate-200" /></div>
        ) : visibleCountries.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-slate-900">No matching destinations</h3>
            <p className="mt-2 text-slate-600">Try another spelling or clear one of your filters.</p>
            <button onClick={() => { setSearch(""); setRegion("All regions"); }} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Clear filters</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCountries.map((country) => {
              const firstCurrency = Object.keys(country.currencies || {})[0];
              return (
                <article key={country.cca2} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-slate-100 p-6">
                    {country.flags?.svg || country.flags?.png
                      ? <img src={country.flags.svg || country.flags.png} alt={`Flag of ${country.name.common}`} loading="lazy" className="max-h-28 max-w-full rounded-md object-contain shadow-sm" />
                      : <span className="text-3xl font-bold text-slate-400">{country.cca2}</span>}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="text-xl font-bold text-slate-950">{country.name.common}</h3><p className="mt-1 text-sm text-slate-500">{country.name.official}</p></div>
                      <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{country.cca2}</span>
                    </div>
                    <dl className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Capital</dt><dd className="text-right font-semibold text-slate-800">{country.capital?.join(", ") || "Not listed"}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Region</dt><dd className="text-right font-semibold text-slate-800">{country.region || "Not listed"}{country.subregion ? ` · ${country.subregion}` : ""}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Currency</dt><dd className="text-right font-semibold text-slate-800">{asCurrencyName(country)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Population</dt><dd className="text-right font-semibold text-slate-800">{populationLabel(country.population)}</dd></div>
                    </dl>
                    <Link to={`/profile?destination=${encodeURIComponent(country.name.common)}`} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition group-hover:bg-blue-700">
                      Save / personalize this destination
                    </Link>
                    {firstCurrency && <p className="mt-3 text-center text-xs text-slate-400">Currency code: {firstCurrency}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="mt-8 text-xs leading-5 text-slate-500">Country information is supplied by REST Countries; reference exchange rates are supplied by Frankfurter. Availability, coverage and update frequency depend on those providers. Verify travel requirements with official authorities before booking.</p>
      </section>
    </main>
  );
};

export default ExploreWorld;
