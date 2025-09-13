const express = require("express");

const clientRoute = express.Router();
const {
  userAuth,
  firmAdminAuth,
  allowRoles,
  LawyerAuth,
} = require("../middlewares/authMiddleware");
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getAllClientsOfLawyer,
} = require("../controllers/client.controller");
const multer = require("multer");
const path = require("path");
const checkPermission = require("../middlewares/checkPermission");
const permissions = require("../constants/permissions");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/clients"); // store images here
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

clientRoute.post(
  "/:firmId/addClient",
  userAuth,
  allowRoles(["Firm Admin", "Lawyer"]),
  upload.single("profileImage"),
  checkPermission(permissions.CREATE_CLIENT),
  createClient
);
clientRoute.get(
  "/firm/:firmId/clients",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.READ_CLIENT),
  getAllClients
);
clientRoute.get(
  "/firm/client/:id",
  userAuth,
  allowRoles(["Firm Admin", "Lawyer"]),
  checkPermission(permissions.READ_CLIENT),
  getClientById
);
clientRoute.put(
  "/firm/client/:id",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.UPDATE_CLIENT),
  updateClient
);
clientRoute.delete(
  "/firm/client/:id",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.DELETE_CLIENT),
  deleteClient
);
clientRoute.get(
  "/lawyer/clients",
  userAuth,
  LawyerAuth,
  checkPermission(permissions.READ_CLIENT),
  getAllClientsOfLawyer
);

module.exports = clientRoute;
