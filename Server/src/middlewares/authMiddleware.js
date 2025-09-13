const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Please login to access this resource",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = {
      id: user.id,
      role: decoded.role || user.role?.name, // now it’s a string
      firmId: decoded.firmId ?? null,
    };

    next();
  } catch (err) {``
    return res
      .status(401)
      .json({ success: false, error: "Invalid token, Please login again" });
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

const allowRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: `Access denied! Only ${roles.join(", ")} allowed`,
    });
  }
  next();
}
const LawyerAuth = (req, res, next) => {
  if (req.user.role !== "Lawyer") {
    return res.status(403).json({
      success: false,
      error: "Access denied! Lawyer only",
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

module.exports = { userAuth, firmAdminAuth, superAdminAuth, LawyerAuth, allowRoles };
