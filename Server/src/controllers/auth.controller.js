const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  UserSignUpValidation,
  UserLoginInValidation,
} = require("../utils/validation");
const { Firm, User, AdminFirm, Lawyer } = require("../models/index.js");
const { where } = require("sequelize");

// Signup api for normal users like superadmin lawyer and clients
const SignUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    let role = "Firm Admin";

    // Validate input
    const validationResult = UserSignUpValidation(req, res);
    if (validationResult) return;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password and Confirm Password do not match",
      });
    }
    const HASHED_PASSWORD = await bcrypt.hash(password, 10);

    const userData = { name, email, password: HASHED_PASSWORD, role };

    const user = await User.create(userData);
    const safeUser = user.toJSON();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: "User signup successfully",
      safeUser: user,
    });
  } catch (err) {
    console.log("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const LoginIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with related firms
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: AdminFirm,
          as: "adminFirms",
          include: [{ model: Firm, as: "firm" }],
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        firmId: user.adminFirms?.length > 0 ? user.adminFirms[0].firm.id : null, // 👈 use firm.id
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Save token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true if https
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firms: user.adminFirms.map((af) => ({
          id: af.firm.id,
          name: af.firm.name,
        })),
        currentFirmId:
          user.adminFirms?.length > 0 ? user.adminFirms[0].firmId : null,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
  }
};

const Logout = (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { SignUp, LoginIn, Logout };
