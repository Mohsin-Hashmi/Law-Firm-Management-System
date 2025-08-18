const express = require("express");
const { createFirm, firmStats, createLawyer } = require("../controllers/firm.controller");
const adminRoute = express();
const { userAuth, firmAdminAuth } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/lawyers"); // store images here
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
adminRoute.post("/firm", userAuth, firmAdminAuth, createFirm);

// Add lawyer with profile image
adminRoute.post(
  "/:firmId/addlawyers",
  userAuth,
  firmAdminAuth,
  upload.single("profileImage"), // <--- multer middleware
  createLawyer
);

adminRoute.get("/firms/:id", userAuth, firmAdminAuth, firmStats);

module.exports = adminRoute;
