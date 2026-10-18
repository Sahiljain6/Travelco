const crypto = require("crypto");

function parseIdempotencyKey(value) {
  if (value === undefined || value === null || value === "") return { provided: false, key: null };
  if (typeof value !== "string" || value.length < 16 || value.length > 128 ||
      !/^[A-Za-z0-9._:-]+$/.test(value)) {
    return { provided: true, key: null, valid: false };
  }
  return { provided: true, key: value, valid: true };
}

function fingerprintVehicleReservationRequest({ vehicleId, pickupDate, returnDate, needDriver }) {
  const stablePayload = JSON.stringify({
    vehicleId: String(vehicleId || ""),
    pickupDate: new Date(pickupDate).toISOString().slice(0, 10),
    returnDate: new Date(returnDate).toISOString().slice(0, 10),
    needDriver: needDriver === true || needDriver === "true",
  });
  return crypto.createHash("sha256").update(stablePayload).digest("hex");
}

module.exports = { parseIdempotencyKey, fingerprintVehicleReservationRequest };
