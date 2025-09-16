const express = require("express");
const authRoutes = express.Router();
const { SignUp, LoginIn, Logout, resetPassword, getCurrentUser } = require("../controllers/auth.controller");
const { userAuth } = require("../middlewares/authMiddleware");

authRoutes.post("/signup", SignUp);
authRoutes.post("/login", LoginIn);
authRoutes.post("/logout", Logout);
authRoutes.post("/reset-password", resetPassword);
authRoutes.get("/me", userAuth, getCurrentUser);

module.exports = authRoutes;
