const express = require("express");
const authRoutes = express.Router();
const { SignUp, LoginIn, Logout } = require("../controllers/auth.controller");
authRoutes.post("/signup", SignUp);
authRoutes.post("/login", LoginIn);
authRoutes.post("/logout", Logout);

module.exports = authRoutes;
