const express = require("express");
const caseRoute = express.Router();
const { userAuth, firmAdminAuth } = require("../middlewares/authMiddleware");
const {
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
  updateCaseStatus,
  getAllCasesOfClient,
  getAllCasesOfFirm,
  getAllCasesOfLawyer,
  addDocumentsByCase,
  getAllDocumentsByCase,
  getOneDocumentOfCase,
  deleteDocumentOfCase,
} = require("../controllers/case.controller");
const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/case-documents"); //local storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// CASE MANAGEMENT
caseRoute.post(
  "/:firmId/addCase",
  userAuth,
  firmAdminAuth,
  upload.array("documents", 5),
  createCase
);
caseRoute.get(
  "/firm/:firmId/cases",
  userAuth,
  firmAdminAuth,
  getAllCasesOfFirm
);
caseRoute.get(
  "/firm/:firmId/cases/:caseId",
  userAuth,
  firmAdminAuth,
  getCaseById
);
caseRoute.put(
  "/firm/:firmId/cases/:caseId",
  userAuth,
  firmAdminAuth,
  updateCase
);
caseRoute.delete(
  "/firm/:firmId/cases/:caseId",
  userAuth,
  firmAdminAuth,
  deleteCase
);
caseRoute.patch(
  "/firm/:firmId/cases/:caseId/status",
  userAuth,
  firmAdminAuth,
  updateCaseStatus
);

// ENTITY FILTERS
caseRoute.get(
  "/clients/:clientId/cases",
  userAuth,
  firmAdminAuth,
  getAllCasesOfClient
);
caseRoute.get(
  "/lawyers/:lawyerId/cases",
  userAuth,
  firmAdminAuth,
  getAllCasesOfLawyer
);

// DOCUMENT MANAGEMENT
caseRoute.post(
  "/firm/:firmId/cases/:caseId/documents",
  userAuth,
  firmAdminAuth,
  upload.array("documents", 5),
  addDocumentsByCase
);
caseRoute.get(
  "/firm/:firmId/cases/:caseId/documents",
  userAuth,
  firmAdminAuth,
  getAllDocumentsByCase
);
caseRoute.get(
  "/firm/:firmId/cases/:caseId/documents/:docId",
  userAuth,
  firmAdminAuth,
  getOneDocumentOfCase
);
caseRoute.delete(
  "/firm/:firmId/cases/:caseId/documents/:docId",
  userAuth,
  firmAdminAuth,
  deleteDocumentOfCase
);

module.exports = caseRoute;
