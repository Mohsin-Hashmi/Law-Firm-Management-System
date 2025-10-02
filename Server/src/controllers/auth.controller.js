const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const {
  UserSignUpValidation,
  UserLoginInValidation,
} = require("../utils/validation.js");
const {
  Firm,
  User,
  AdminFirm,
  Lawyer,
  Role,
  Permission,
  UserFirm,
  Client,
} = require("../models/index.js");
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

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists. Please use a different email.",
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
    console.log("🔵 LOGIN REQUEST RECEIVED");
    console.log("🔵 REQUEST BODY:", req.body);

    const { email, password } = req.body;

    // Find user with associations
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "role",
          include: [{ model: Permission, as: "permissions" }],
        },
        {
          model: AdminFirm,
          as: "adminFirms",
          include: [{ model: Firm, as: "firm" }],
        },
        {
          model: Lawyer,
          as: "lawyers",
          include: [{ model: Firm, as: "firm" }],
        },
        {
          model: Client,
          as: "client",
          include: [{ model: Firm, as: "firm" }],
        },
        {
          model: UserFirm,
          as: "userFirms",
          include: [
            { model: Firm, as: "firm" },
            { model: Role, as: "role" },
          ],
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

    // ---- Build firms dynamically ----
    let firms = [];
    let activeFirmId = null;

    if (user.role?.name === "Firm Admin" || user.role?.name === "Super Admin") {
      firms = user.adminFirms?.map((af) => ({
        id: af.firm?.id,
        name: af.firm?.name,
      })) || [];
      activeFirmId = firms.length > 0 ? firms[0].id : null;

    } else if (user.role?.name === "Lawyer") {
      if (Array.isArray(user.lawyers)) {
        firms = user.lawyers.map((lf) => ({
          id: lf.firm?.id,
          name: lf.firm?.name,
        }));
      } else if (user.lawyers) {
        firms = [{
          id: user.lawyers.firm?.id,
          name: user.lawyers.firm?.name,
        }];
      }
      activeFirmId = firms.length > 0 ? firms[0].id : null;

    } else if (user.role?.name === "Client") {
      if (Array.isArray(user.client)) {
        firms = user.client.map((cl) => ({
          id: cl.firm?.id,
          name: cl.firm?.name,
        }));
      } else if (user.client) {
        firms = [{
          id: user.client.firm?.id,
          name: user.client.firm?.name,
        }];
      }
      activeFirmId = firms.length > 0 ? firms[0].id : null;

    } else {
      // Other roles (using UserFirm)
      firms = user.userFirms?.map((uf) => ({
        id: uf.firm?.id,
        name: uf.firm?.name,
        roleId: uf.roleId,
      })) || [];
      activeFirmId = firms.length > 0 ? firms[0].id : null;
    }

    // ---- Must change password case ----
    if (user.mustChangePassword) {
      return res.status(200).json({
        success: true,
        mustChangePassword: true,
        message: "Password reset required before accessing dashboard",
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          mustChangePassword: true,
          permissions: user.role?.permissions.map((p) => p.name) || [],
          firms,
          activeFirmId,
        },
      });
    }

    // ---- Generate JWT ----
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role?.name,
        firmIds: firms.length > 0 ? firms.map((f) => f.id) : [],
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---- Set cookie ----
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ---- Final response ----
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        mustChangePassword: user.mustChangePassword,
        permissions: user.role?.permissions.map((p) => p.name) || [],
        firms,
        activeFirmId,
      },
      token,
    });

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: "role",
          include: [{ model: Permission, as: "permissions" }],
        },
        {
          model: AdminFirm,
          as: "adminFirms",
          include: [{ model: Firm, as: "firm" }],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        mustChangePassword: user.mustChangePassword,
        permissions: user.role?.permissions.map((p) => p.name) || [],
        firms: user.adminFirms.map((af) => ({
          id: af.firm.id,
          name: af.firm.name,
        })),
        activeFirmId:
          user.adminFirms?.length > 0 ? user.adminFirms[0].firmId : null,
        firmId: user.adminFirms?.length > 0 ? user.adminFirms[0].firmId : null,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { SignUp, LoginIn, Logout, resetPassword, getCurrentUser };
