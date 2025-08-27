const express = require("express");

const clientRoute = express.Router();
const { userAuth, firmAdminAuth } = require("../middlewares/authMiddleware");
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/client.controller");
const multer = require("multer");
const path = require("path");

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
  firmAdminAuth,
  upload.single("profileImage"),
  createClient
);
clientRoute.get(
  "/firm/:firmId/clients",
  userAuth,
  firmAdminAuth,
  getAllClients
);
clientRoute.get("/firm/client/:id", userAuth, firmAdminAuth, getClientById);
clientRoute.post("/firm/client/:id", userAuth, firmAdminAuth, updateClient);
clientRoute.delete("/firm/client/:id", userAuth, firmAdminAuth, deleteClient);

module.exports = clientRoute;
