const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  if (!process.env.JWT) throw new Error("JWT environment variable is required");
  return jwt.sign({ id: String(id) }, process.env.JWT, { expiresIn: "30d" });
};

module.exports = generateToken;
