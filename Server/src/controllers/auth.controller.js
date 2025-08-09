const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const {
  UserSignUpValidation,
  UserLoginInValidation,
} = require("../utils/validation");
const { User } = require("../models");
const { where } = require("sequelize");
const jwt = require("jsonwebtoken");
const SignUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    let role = "Lawyer";
    const validationResult = UserSignUpValidation(req, res);
    if (validationResult) return;
    if (req.path === "/signup/firm-admin") {
      role = "Firm Admin";
    }
    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password and Confirm Password do not match",
      });
    }
    const HASHED_PASSWORD = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: HASHED_PASSWORD,
      role,
    });
    const safeUser = user.toJSON();
    delete safeUser.password;
    res
      .status(201)
      .json({ success: true, message: "User signup successfully", safeUser });
  } catch (err) {
    console.log("error is", err);
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
    const validationResult = UserLoginInValidation(req, res);
    if (validationResult) return;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod
      sameSite: "none",
    });
    const safeUser = user.toJSON();
    delete safeUser.password;
    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const Logout = (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  SignUp,
  LoginIn,
  Logout,
};
