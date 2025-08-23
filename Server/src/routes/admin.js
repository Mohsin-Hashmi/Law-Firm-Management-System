const express = require("express");
const {
  createFirm,
  firmStats,
  createLawyer,
  getAllLawyer,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
  switchFirm
} = require("../controllers/firm.controller");
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
  upload.single("profileImage"),
  createLawyer
);
adminRoute.get(
  "/firms/:id/stats", 
  userAuth, 
  firmAdminAuth, 
  firmStats
);
adminRoute.get("/firms/lawyers", userAuth, firmAdminAuth, getAllLawyer);
adminRoute.get("/firm/lawyer/:id", userAuth, firmAdminAuth, getLawyerById);
adminRoute.put(
  "/firm/lawyer/:id",
  userAuth,
  firmAdminAuth,
  upload.single("profileImage"),
  updateLawyer
);
adminRoute.delete(
  "/firm/lawyer/:id",
  userAuth,
  firmAdminAuth,
  deleteLawyer
);

adminRoute.post("/switch-firm", userAuth, firmAdminAuth,  switchFirm);


module.exports = adminRoute;
