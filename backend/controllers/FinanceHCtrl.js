const Finance = require("../models/FinanceHealth");

const addRecord = async (req, res) => {
  try {
    const fields = ["RecordId", "Section", "Income", "Expences", "Month"];
    const data = Object.fromEntries(fields.filter((key) => req.body?.[key] !== undefined).map((key) => [key, req.body[key]]));
    for (const key of ["Income", "Expences"]) {
      if (data[key] !== undefined && (data[key] === "" || data[key] === null || !Number.isFinite(Number(data[key])) || Number(data[key]) < 0)) {
        return res.status(400).json({ message: key + " must be a non-negative number; decimal amounts are allowed" });
      }
      if (data[key] !== undefined) data[key] = Number(data[key]);
    }
    const record = await Finance.create(data);
    return res.status(201).json(record);
  } catch { return res.status(400).json({ message: "Unable to create financial record" }); }
};

const getAllRecords = async (req, res) => {
  try { return res.status(200).json(await Finance.find().sort({ Month: -1 })); }
  catch { return res.status(500).json({ message: "Unable to retrieve financial records" }); }
};

const getOneRecord = async (req, res) => {
  try {
    const record = await Finance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Financial record not found" });
    return res.status(200).json(record);
  } catch { return res.status(400).json({ message: "Invalid financial record ID" }); }
};

const deleteRecord = async (req, res) => {
  try {
    const record = await Finance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Financial record not found" });
    return res.status(200).json({ message: "Financial record deleted" });
  } catch { return res.status(400).json({ message: "Invalid financial record ID" }); }
};

const updateRecord = async (req, res) => {
  try {
    const fields = ["RecordId", "Section", "Income", "Expences", "Month"];
    const data = Object.fromEntries(fields.filter((key) => req.body?.[key] !== undefined).map((key) => [key, req.body[key]]));
    for (const key of ["Income", "Expences"]) {
      if (data[key] !== undefined && (!Number.isFinite(Number(data[key])) || Number(data[key]) < 0)) {
        return res.status(400).json({ message: key + " must be a non-negative number" });
      }
    }
    const record = await Finance.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: "Financial record not found" });
    return res.status(200).json({ status: "updated", record });
  } catch { return res.status(400).json({ message: "Unable to update financial record" }); }
};

module.exports = { addRecord, getAllRecords, getOneRecord, deleteRecord, updateRecord };
