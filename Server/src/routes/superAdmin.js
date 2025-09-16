const express = require("express");
const superAdminRoutes = express.Router();
const { userAuth, superAdminAuth } = require("../middlewares/authMiddleware");
const {
  getAllFirms,
  getFirmById,
  deleteFirm,
  updateFirmStatus,
  updateFirmSubscription,
  getPlatformOverview,
  getAllLawyers,
  getLawyerById,
  deleteLawyer,
  updateLawyerStatus,
  getAllClients,
  getClientById,
  deleteClient,
  getCaseMetadata
} = require("../controllers/superAdmin.controller");

superAdminRoutes.get("/firms", userAuth, superAdminAuth, getAllFirms);
superAdminRoutes.get("/firm/:id", userAuth, superAdminAuth, getFirmById);
superAdminRoutes.patch(
  "/firms/:id/status",
  userAuth,
  superAdminAuth,
  updateFirmStatus
);
superAdminRoutes.patch(
  "/firm/:id/subscription",
  userAuth,
  superAdminAuth,
  updateFirmSubscription
);
superAdminRoutes.delete("/firm/:id", userAuth, superAdminAuth, deleteFirm);
superAdminRoutes.get(
  "/platform/overview",
  userAuth,
  superAdminAuth,
  getPlatformOverview
);
superAdminRoutes.get("/lawyers", userAuth, superAdminAuth, getAllLawyers);
superAdminRoutes.get("/lawyer/:id", userAuth, superAdminAuth, getLawyerById);
superAdminRoutes.delete("/lawyer/:id", userAuth, superAdminAuth, deleteLawyer);
superAdminRoutes.patch(
  "/lawyer/:id/status",
  userAuth,
  superAdminAuth,
  updateLawyerStatus
);
superAdminRoutes.get("/clients", userAuth, superAdminAuth, getAllClients);
superAdminRoutes.get("/client/:id", userAuth, superAdminAuth, getClientById);
superAdminRoutes.delete("/client/:id", userAuth, superAdminAuth, deleteClient);
superAdminRoutes.get("/cases/metadata", userAuth, superAdminAuth, getCaseMetadata);

module.exports = superAdminRoutes;
