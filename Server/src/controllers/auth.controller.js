const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  UserSignUpValidation,
  UserLoginInValidation,
} = require("../utils/validation.js");
const { Firm, User, AdminFirm, Lawyer, Role } = require("../models/index.js");
const { where } = require("sequelize");

// Signup api for normal users like superadmin lawyer and clients
const SignUp = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

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

    // By default assigning Firm Admin role
    const roleObj = await Role.findOne({ where: { name: "Firm Admin" } });
    if (!roleObj) {
      return res
        .status(400)
        .json({ success: false, message: "Role not found" });
    }

    const userData = {
      name,
      email,
      password: HASHED_PASSWORD,
      roleId: roleObj.id,
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "User signup successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleObj.name,
        firms: [],
      },
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

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: "role" },
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

    // ✅ HERE: Check mustChangePassword BEFORE generating token
    if (user.mustChangePassword) {
      return res.status(200).json({
        success: true,
        mustChangePassword: true,
        message: "Password reset required before accessing dashboard",
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          mustChangePassword: true, // 👈 added here
        },
      });
    }

    // ✅ Normal login flow continues here...
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role.name,
        firmId:
          user.adminFirms?.length > 0 ? user.adminFirms[0].firm.id : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        mustChangePassword: user.mustChangePassword, // 👈 also safe to include here
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

const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false; // ✅ allow login normally now
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
module.exports = { SignUp, LoginIn, Logout, resetPassword };
