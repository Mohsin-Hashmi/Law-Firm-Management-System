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

clientRoute.post("/:firmId/addClient", userAuth, firmAdminAuth, createClient);
clientRoute.get("/firm/:firmId/clients", userAuth, firmAdminAuth, getAllClients);
clientRoute.get("/firm/client/:id", userAuth, firmAdminAuth, getClientById);
clientRoute.post("/firm/client/:id", userAuth, firmAdminAuth, updateClient);
clientRoute.delete("/firm/client/:id", userAuth, firmAdminAuth, deleteClient);

module.exports = clientRoute;
