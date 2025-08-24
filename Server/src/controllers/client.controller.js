const { Client, Lawyer } = require("../models");

/**Create Client API */
const createClient = async (req, res) => {
  try {
    const firmId = req.user.firmId;
    const {
      fullName,
      email,
      phone,
      address,
      clientType,
      organization,
      status,
    } = req.body;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm Id not found",
      });
    }
    const client = await Client.create({
      firmId,
      fullName,
      email,
      phone,
      address,
      clientType,
      organization,
      status,
    });
    return res.status(200).json({
      success: true,
      message: "Client Created Successfully",
      client: client,
    });
  } catch (error) {
    console.log("Error is", error)
    res
      .status(400)
      .json({
        success: false,
        message: "Failed to create client",
        error: error.message,
      });
  }
};

/**Get All Clients API */
const getAllClients = async (req, res) => {
  try {
  } catch (error) {}
};

/**Get Client By Id API */
const getClientById = async (req, res) => {
  try {
  } catch (error) {}
};

/**Update Client By Id API */
const updateClient = async (req, res) => {
  try {
  } catch (error) {}
};

/**Delete Client By Id API */
const deleteClient = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
