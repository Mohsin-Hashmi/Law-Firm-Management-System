const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  UserSignUpValidation,
  UserLoginInValidation,
} = require("../utils/validation");
const { User, Firm } = require("../models");

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

// const AdminSignUp = async (req, res) => {
//   try {
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };
const LoginIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationResult = UserLoginInValidation(req, res);
    if (validationResult) return;

    // Ensure user belongs to this firm
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, firmId: user.firmId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = user.toJSON();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: safeUser,
      token,
    });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({
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
