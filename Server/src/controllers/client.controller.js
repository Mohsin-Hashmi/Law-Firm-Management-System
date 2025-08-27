const { where } = require("sequelize");
const { Client, Lawyer, Case } = require("../models");
const validate = require("validator");
/**Create Client API */
const createClient = async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    const {
      fullName,
      dob,
      gender,
      email,
      phone,
      address,
      clientType,
      organization,
      status,
      billingAddress,
      outstandingBalance,
    } = req.body;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm Id not found",
      });
    }

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and phone are required.",
      });
    }
    if (!validate.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    if (!validate.isMobilePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format.",
      });
    }

    const validateClientType = ["Individual", "Business", "Corporate"];
    if (clientType && !validateClientType.includes(clientType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid client type. Must be one of: ${validClientTypes.join(
          ", "
        )}`,
      });
    }

    const validStatuses = ["Active", "Past", "Potential", "Suspended"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (outstandingBalance && isNaN(outstandingBalance)) {
      return res.status(400).json({
        success: false,
        message: "Outstanding balance must be a number.",
      });
    }

    const existingClient= await Client.findOne({
      where: {
        email,
        firmId
      }
    });
    if(existingClient){
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists in the firm"
      })
    }

    let profileImage = null;
    if(req.file) profileImage= `/uploads/clients/${req.file.filename}`
    const client = await Client.create({
      firmId,
      fullName,
      dob,
      gender,
      email,
      phone,
      address,
      clientType,
      organization,
      status,
      billingAddress,
      outstandingBalance,
      profileImage
    });
    return res.status(200).json({
      success: true,
      message: "Client Created Successfully",
      client: client,
    });
  } catch (error) {
    console.log("Error is", error);
    res.status(400).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};

/**Get All Clients API */
const getAllClients = async (req, res) => {
  try {
    const firmId = req.user?.firmId;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm ID not found",
      });
    }
    const clients = await Client.findAll({
      where: { firmId },
      include: [
        {
          model: Lawyer,
          as: "lawyers",
          attributes: ["id", "name", "email", "phone", "specialization"],
          through: { attributes: [] }, // hide join table fields
        },
        {
          model: Case,
          as: "cases",
          attributes: [
            "id",
            "title",
            "caseNumber",
            "caseType",
            "status",
            "openedAt",
            "closedAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      count: clients.length,
      clients: clients,
    });
  } catch (error) {
    console.log("Error is", error);
    res.status(400).json({
      success: false,
      message: "Failed to get clients",
      error: error.message,
    });
  }
};

/**Get Client By Id API */
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = req.user.firmId;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "client Id is required",
      });
    }
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm Id not found",
      });
    }
    const client = await Client.findOne({
      where: {
        id,
        firmId,
      },
      include: [
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] },
        },
        {
          model: Case,
          as: "cases",
        },
      ],
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found in your firm",
      });
    }
    res.status(200).json({
      success: true,
      message: "client found successfully",
      client: client,
    });
  } catch (error) {
    console.error("Error fetching client by id:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client by id",
    });
  }
};

/**Update Client By Id API */
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = req.user.firmId;
    const {
      fullName,
      dob,
      gender,
      email,
      phone,
      address,
      clientType,
      organization,
      status,
      billingAddress,
      outstandingBalance,
    } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client Id in required",
      });
    }
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm Id not found",
      });
    }
    const client = await Client.findOne({
      where: {
        id,
        firmId,
      },
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found or not part of your firm",
      });
    }
    await client.update({
      fullName: fullName ?? client.fullName,
      dob: dob ?? client.dob,
      gender: gender ?? client.gender,
      email: email ?? client.email,
      phone: phone ?? client.phone,
      address: address ?? client.address,
      clientType: clientType ?? client.clientType,
      organization: organization ?? client.organization,
      status: status ?? client.status,
      billingAddress: billingAddress ?? client.billingAddress,
      outstandingBalance:
        outstandingBalance !== undefined
          ? outstandingBalance
          : client.outstandingBalance,
    });

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      updatedClient: client,
    });
  } catch (error) {
    console.error("Update Client Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
};

/**Delete Client By Id API */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = req.user.firmId;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client Id is required",
      });
    }
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm Id not found",
      });
    }
    const client = await Client.findOne({
      where: {
        id,
        firmId,
      },
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found in your frim",
      });
    }
    await client.destroy();
    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      client: client
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting client",
    });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
