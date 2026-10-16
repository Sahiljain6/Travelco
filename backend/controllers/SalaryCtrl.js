const Salary = require("../models/Salary");

const fields = ["Name", "Nic", "Eid", "JobPosition", "BasicSalary", "NetSalary", "OtHours", "Numberaofdates"];
const getPayload = (body = {}) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const validateSalary = (data) => {
  if (data.BasicSalary !== undefined && (!Number.isFinite(Number(data.BasicSalary)) || Number(data.BasicSalary) <= 0)) {
    return "BasicSalary must be greater than zero; decimal values are allowed";
  }
  if (data.NetSalary !== undefined && (!Number.isFinite(Number(data.NetSalary)) || Number(data.NetSalary) < 0)) {
    return "NetSalary must be zero or greater";
  }
  if (data.OtHours !== undefined && (!Number.isSafeInteger(Number(data.OtHours)) || Number(data.OtHours) < 0 || Number(data.OtHours) > 130)) {
    return "OtHours must be a whole number between 0 and 130";
  }
  if (data.Numberaofdates !== undefined && (!Number.isSafeInteger(Number(data.Numberaofdates)) || Number(data.Numberaofdates) < 1 || Number(data.Numberaofdates) > 26)) {
    return "Numberaofdates must be a whole number between 1 and 26";
  }
  if (data.BasicSalary !== undefined) data.BasicSalary = Number(data.BasicSalary);
  if (data.NetSalary !== undefined) data.NetSalary = Number(data.NetSalary);
  if (data.OtHours !== undefined) data.OtHours = Number(data.OtHours);
  if (data.Numberaofdates !== undefined) data.Numberaofdates = Number(data.Numberaofdates);
  return null;
};

const addSalary = async (req, res) => {
  try {
    const data = getPayload(req.body);
    const issue = validateSalary(data);
    if (issue) return res.status(400).json({ message: issue });
    return res.status(201).json(await Salary.create(data));
  } catch { return res.status(400).json({ message: "Unable to create salary record" }); }
};

const getAllSalary = async (req, res) => {
  try { return res.status(200).json(await Salary.find().sort({ Name: 1 })); }
  catch { return res.status(500).json({ message: "Unable to retrieve salary records" }); }
};

const getOneSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });
    return res.status(200).json(salary);
  } catch { return res.status(400).json({ message: "Invalid salary record ID" }); }
};

const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: "Salary record not found" });
    return res.status(200).json({ message: "Salary record deleted" });
  } catch { return res.status(400).json({ message: "Invalid salary record ID" }); }
};

const updateSalary = async (req, res) => {
  try {
    const data = getPayload(req.body);
    const issue = validateSalary(data);
    if (issue) return res.status(400).json({ message: issue });
    const salary = await Salary.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!salary) return res.status(404).json({ message: "Salary record not found" });
    return res.status(200).json({ status: "updated", salary });
  } catch { return res.status(400).json({ message: "Unable to update salary record" }); }
};

module.exports = { addSalary, getAllSalary, getOneSalary, deleteSalary, updateSalary };
