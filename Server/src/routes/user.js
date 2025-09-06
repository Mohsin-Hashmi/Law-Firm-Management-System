const express = require("express");
const authRoutes = express.Router();
const { SignUp, LoginIn, Logout, resetPassword } = require("../controllers/auth.controller");
authRoutes.post("/signup", SignUp);
authRoutes.post("/login", LoginIn);
authRoutes.post("/logout", Logout);
authRoutes.post("/reset-password", resetPassword);
module.exports = authRoutes;
