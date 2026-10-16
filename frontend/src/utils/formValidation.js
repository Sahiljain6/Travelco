// Shared input rules used by booking, listing and admin forms.
export const isValidInternationalPhone = (value) => {
  const text = String(value ?? "").trim();
  if (!/^\+?[0-9\s().-]+$/.test(text)) return false;
  const digits = text.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && !/^0+$/.test(digits);
};

export const isValidPostalCode = (value) => {
  const text = String(value ?? "").trim();
  if (text.length < 2 || text.length > 12 || !/^[A-Za-z0-9][A-Za-z0-9\s-]*$/.test(text)) return false;
  const compact = text.replace(/[\s-]/g, "");
  return /[A-Za-z0-9]/.test(compact) && !/^0+$/.test(compact);
};

export const isPositiveNumber = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const isNonNegativeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
};

export const isPositiveInteger = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0;
};

export const isOptionalRating = (value, max = 5) => {
  if (value === "" || value === null || value === undefined) return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= max;
};
