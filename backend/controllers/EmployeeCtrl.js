const Employee = require("../models/Employee");

const addEmployee = async (req, res) => {
  try {
    const fields = ["Name", "Email", "Nic", "Eid", "Position", "BasicSalary", "Department"];
    const data = Object.fromEntries(fields.filter((key) => req.body?.[key] !== undefined).map((key) => [key, req.body[key]]));
    if (!data.Name || !data.Email) return res.status(400).json({ message: "Employee name and email are required" });
    if (data.BasicSalary !== undefined && (!Number.isFinite(Number(data.BasicSalary)) || Number(data.BasicSalary) < 0)) {
      return res.status(400).json({ message: "Basic salary must be a non-negative number" });
    }
    const employee = await Employee.create(data);
    return res.status(201).json(employee);
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Employee already exists" : "Unable to create employee" });
  }
};

const getAllEmployees = async (req, res) => {
  try { return res.status(200).json(await Employee.find().sort({ Name: 1 })); }
  catch { return res.status(500).json({ message: "Unable to retrieve employees" }); }
};

const getOneEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.status(200).json(employee);
  } catch { return res.status(400).json({ message: "Invalid employee ID" }); }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.status(200).json({ message: "Employee deleted" });
  } catch { return res.status(400).json({ message: "Invalid employee ID" }); }
};

const updateEmployee = async (req, res) => {
  try {
    const fields = ["Name", "Email", "Nic", "Eid", "Position", "BasicSalary", "Department"];
    const data = Object.fromEntries(fields.filter((key) => req.body?.[key] !== undefined).map((key) => [key, req.body[key]]));
    if (data.BasicSalary !== undefined && (!Number.isFinite(Number(data.BasicSalary)) || Number(data.BasicSalary) < 0)) {
      return res.status(400).json({ message: "Basic salary must be a non-negative number" });
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.status(200).json({ status: "updated", employee });
  } catch { return res.status(400).json({ message: "Unable to update employee" }); }
};

module.exports = { addEmployee, getAllEmployees, getOneEmployee, deleteEmployee, updateEmployee };
