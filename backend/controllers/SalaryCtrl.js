const Salary = require("../models/Salary");

const fields = ["Name", "Nic", "Eid", "Position", "BasicSalary", "OtHours", "Numberofdates"];
const getPayload = (body = {}) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const validateSalary = (data) => {
  for (const key of ["BasicSalary", "OtHours", "Numberofdates"]) {
    if (data[key] !== undefined && (!Number.isFinite(Number(data[key])) || Number(data[key]) < 0)) return key + " must be a non-negative number";
  }
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
