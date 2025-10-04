const express = require("express");
const caseRoute = express.Router();
const {
  userAuth,
  firmAdminAuth,
  LawyerAuth,
  allowRoles,
  allowRolesForCaseDocuments
} = require("../middlewares/authMiddleware");
const {
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
  updateCaseStatus,
  getAllCasesOfClient,
  getAllCasesOfFirm,
  getAllCasesOfLawyer,
  getAllCasesDocumentsByFirm,
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
  allowRoles(["Firm Admin", "Lawyer"]),
  upload.array("documents", 5),
  checkPermission(permissions.CREATE_CASE),
  createCase
);
caseRoute.get(
  "/firm/cases",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_CASE),
  getAllCasesOfFirm
);
caseRoute.get(
  "/firm/cases/:caseId",
  userAuth,
  allowRoles(["Firm Admin", "Lawyer", "Client"]),
  checkPermission(permissions.READ_CASE),
  getCaseById
);
caseRoute.put(
  "/firm/cases/:caseId",
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
  allowRoles(["Client", "Firm Admin"]),
  checkPermission(permissions.READ_CASE),
  getAllCasesOfClient
);
caseRoute.get(
  "/lawyer/cases",
  userAuth,
  allowRoles([ "Firm Admin", "Lawyer"]),
  checkPermission(permissions.READ_CASE),
  getAllCasesOfLawyer
);

//DOCUMENT MANAGEMENT
caseRoute.get(
  "/firm/cases/documents",
  userAuth,
  allowRolesForCaseDocuments,
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getAllCasesDocumentsByFirm
);
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

// Lawyer document routes
caseRoute.post(
  "/lawyer/cases/:caseId/documents",
  userAuth,
  allowRoles(["Lawyer", "Super Admin", "Firm Admin"]),
  upload.array("documents", 5),
  checkPermission(permissions.UPLOAD_CASE_DOCUMENT),
  addDocumentsByCase
);
caseRoute.get(
  "/lawyer/cases/:caseId/documents",
  userAuth,
  allowRoles(["Lawyer", "Super Admin", "Firm Admin"]),
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getAllDocumentsByCase
);
caseRoute.get(
  "/lawyer/cases/:caseId/documents/:docId",
  userAuth,
  allowRoles(["Lawyer", "Super Admin", "Firm Admin"]),
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getOneDocumentOfCase
);

// Client document routes
caseRoute.post(
  "/client/cases/:caseId/documents",
  userAuth,
  allowRoles(["Client", "Super Admin", "Firm Admin"]),
  upload.array("documents", 5),
  checkPermission(permissions.UPLOAD_CASE_DOCUMENT),
  addDocumentsByCase
);
caseRoute.get(
  "/client/cases/:caseId/documents",
  userAuth,
  allowRoles(["Client", "Super Admin", "Firm Admin"]),
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getAllDocumentsByCase
);
caseRoute.get(
  "/client/cases/:caseId/documents/:docId",
  userAuth,
  allowRoles(["Client", "Super Admin", "Firm Admin"]),
  checkPermission(permissions.VIEW_CASE_DOCUMENTS),
  getOneDocumentOfCase
);

module.exports = caseRoute;
