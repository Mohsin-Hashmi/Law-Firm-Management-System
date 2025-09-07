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
const permissions = require("../constants/permissions");
const checkPermission = require("../middlewares/checkPermission");

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
  checkPermission(permissions.CREATE_CASE),
  createCase
);
caseRoute.get(
  "/firm/:firmId/cases",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_CASE),
  getAllCasesOfFirm
);
caseRoute.get(
  "/firm/:firmId/cases/:caseId",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_CASE),
  getCaseById
);
caseRoute.put(
  "/firm/:firmId/cases/:caseId",
  userAuth,
  firmAdminAuth,
  upload.array("documents", 5),
  checkPermission(permissions.UPDATE_CASE),
  updateCase
);
caseRoute.delete(
  "/firm/:firmId/cases/:caseId",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.DELETE_CASE),
  deleteCase
);
caseRoute.patch(
  "/firm/:firmId/cases/:caseId/status",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.UPDATE_CASE_STATUS),
  updateCaseStatus
);

// ENTITY FILTERS
caseRoute.get(
  "/clients/:clientId/cases",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_CASE),
  getAllCasesOfClient
);
caseRoute.get(
  "/lawyer/:lawyerId/cases",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_CASE),
  getAllCasesOfLawyer
);

// DOCUMENT MANAGEMENT
caseRoute.post(
  "/firm/:firmId/cases/:caseId/documents",
  userAuth,
  firmAdminAuth,
  upload.array("documents", 5),
  checkPermission(permissions.UPLOAD_CASE_DOCUMENT),
  addDocumentsByCase
);
caseRoute.get(
  "/firm/:firmId/cases/:caseId/documents",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getAllDocumentsByCase
);
caseRoute.get(
  "/firm/:firmId/cases/:caseId/documents/:docId",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getOneDocumentOfCase
);
caseRoute.delete(
  "/firm/:firmId/cases/:caseId/documents/:docId",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.DELETE_CASE_DOCUMENT),
  deleteDocumentOfCase
);

module.exports = caseRoute;
