const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies
    console.log("token is",token);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Please Login to access the resource",
      });
    }
    const isTokenValid = await jwt.verify(token, process.env.JWT_SECRET);
    if (!isTokenValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid token, Please Login again",
      });
    }
    const user = await User.findByPk(isTokenValid.id);
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid token, Please Login again",
    });
  }
};

const firmAdminAuth = (req, res, next) => {
  if (req.user.role !== "Firm Admin") {
    return res.status(403).json({
      success: false,
      error: "Firm Admin only",
    });
  }
  next();
};

const superAdminAuth = (req, res, next) => {
  if (req.user.role !== "Super Admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied! Super Admin only",
    });
  }
  next();
};

module.exports = { userAuth, firmAdminAuth, superAdminAuth };
