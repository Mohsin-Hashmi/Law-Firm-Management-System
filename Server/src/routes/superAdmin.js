const express = require("express");
const superAdminRoutes = express.Router();
const { userAuth, superAdminAuth } = require("../middlewares/authMiddleware");
const {
  createFirm,
  getAllFirms,
  getFirmById,
  updateFirm,
  deleteFirm,
} = require("../controllers/superAdmin.controller");

superAdminRoutes.post("/firm", userAuth, superAdminAuth, createFirm);
superAdminRoutes.get("/firms", userAuth, superAdminAuth, getAllFirms);
superAdminRoutes.get("/firm/:id",userAuth, superAdminAuth,  getFirmById);
superAdminRoutes.put("/firm/:id",userAuth, superAdminAuth, updateFirm);
superAdminRoutes.delete("/firm/:id",userAuth, superAdminAuth, deleteFirm);
module.exports = superAdminRoutes;
