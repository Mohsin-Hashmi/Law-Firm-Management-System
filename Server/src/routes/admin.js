const express = require("express");
const {
  createFirm,
  firmStats,
  createLawyer,
  getAllLawyer,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
  switchFirm,
  getLawyerPerformance,
  lawyerStats
} = require("../controllers/firm.controller");
const adminRoute = express();
const { userAuth, firmAdminAuth, LawyerAuth } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const permissions = require("../constants/permissions");
const checkPermission = require("../middlewares/checkPermission");

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
adminRoute.post(
  "/firm",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.CREATE_FIRM),
  createFirm
);

// Add lawyer with profile image
adminRoute.post(
  "/:firmId/addlawyers",
  userAuth,
  firmAdminAuth,
  upload.single("profileImage"),
  checkPermission(permissions.CREATE_LAWYER),
  createLawyer
);
adminRoute.get(
  "/firms/:id/stats",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.VIEW_STATS),
  firmStats
);
adminRoute.get(
  "/firms/lawyers",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_LAWYER),
  getAllLawyer
);
adminRoute.get(
  "/firm/lawyer/:id",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_LAWYER),
  getLawyerById
);
adminRoute.put(
  "/firm/lawyer/:id",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.UPDATE_LAWYER),
  upload.single("profileImage"),
  updateLawyer
);
adminRoute.delete(
  "/firm/lawyer/:id",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.DELETE_LAWYER),
  deleteLawyer
);

adminRoute.post("/switch-firm", userAuth, firmAdminAuth, switchFirm);

adminRoute.get(
  "/:id/performance",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_LAWYER),
  getLawyerPerformance
);

adminRoute.get(
  "/lawyers/stats",
  userAuth,
  LawyerAuth,               
  checkPermission(permissions.VIEW_STATS), 
  lawyerStats
);
module.exports = adminRoute;
