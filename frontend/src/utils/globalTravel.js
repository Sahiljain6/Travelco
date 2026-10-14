const CURRENCY_BY_REGION = {
  US: "USD", GB: "GBP", IN: "INR", LK: "LKR", AU: "AUD", CA: "CAD",
  NZ: "NZD", JP: "JPY", CN: "CNY", SG: "SGD", ZA: "ZAR", CH: "CHF",
  AE: "AED", BR: "BRL", MX: "MXN", KR: "KRW", TH: "THB", MY: "MYR",
  ID: "IDR", PH: "PHP", TR: "TRY", SA: "SAR", NG: "NGN", PK: "PKR",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", PT: "EUR",
  IE: "EUR", FI: "EUR", GR: "EUR", AT: "EUR", BE: "EUR"
};

export const getPreferredCurrency = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.match(/[-_]([A-Z]{2})(?:$|[-_])/i)?.[1]?.toUpperCase();
    return CURRENCY_BY_REGION[region] || "USD";
  } catch {
    return "USD";
  }
};

export const supportedCurrencies = [
  "USD", "EUR", "GBP", "INR", "LKR", "AUD", "CAD", "NZD", "JPY", "CNY",
  "SGD", "ZAR", "CHF", "AED", "BRL", "MXN", "KRW", "THB", "MYR", "IDR",
  "PHP", "TRY", "SAR", "NGN", "PKR"
];

export const formatMoney = (amount, currency = "USD", locale) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Price unavailable";
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return value.toLocaleString() + " " + currency;
  }
};
