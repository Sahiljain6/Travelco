const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, "travelcoVerification", {
    expiresIn: "30d",
  });
};

module.exports = generateToken;