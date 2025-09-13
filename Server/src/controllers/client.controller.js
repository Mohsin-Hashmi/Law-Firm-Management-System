const { sequelize } = require("../models");
const { where } = require("sequelize");
const {
  Client,
  Lawyer,
  Case,
  User,
  Role,
  UserFirm,
  ClientLawyer,
} = require("../models");
const validate = require("validator");
const bcrypt = require("bcryptjs");
/**Create Client API */
const createClient = async (req, res) => {
  const t = await sequelize.transaction();
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
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Firm Id not found" });
    }

    if (!fullName || !email || !phone) {
      await t.rollback();
      return res
        .status(400)
        .json({
          success: false,
          message: "Full name, email, and phone are required.",
        });
    }

    // check duplicate
    const existingClient = await Client.findOne({
      where: { email, firmId },
      transaction: t,
    });
    if (existingClient) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists in the firm",
      });
    }

    // check duplicate user
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // find Client role
    const clientRole = await Role.findOne({
      where: { name: "Client" },
      transaction: t,
    });
    if (!clientRole) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Client role not found" });
    }

    // create user
    const hashedPassword = await bcrypt.hash(process.env.DUMMY_PASSWORD, 10);
    const user = await User.create(
      {
        name: fullName,
        email,
        password: hashedPassword,
        roleId: clientRole.id,
        mustChangePassword: true,
      },
      { transaction: t }
    );

    // create user-firm relation
    await UserFirm.create(
      {
        userId: user.id,
        firmId,
        roleId: clientRole.id,
      },
      { transaction: t }
    );

    // handle profile image
    let profileImage = null;
    if (req.file) profileImage = `/uploads/clients/${req.file.filename}`;

    // create client
    const client = await Client.create(
      {
        firmId,
        userId: user.id,
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
        profileImage,
      },
      { transaction: t }
    );
    if (req.user.role === "Lawyer") {
      const lawyer = await Lawyer.findOne({
        where: { userId: req.user.id, firmId },
        transaction: t,
      });

      if (lawyer) {
        await ClientLawyer.create(
          {
            lawyerId: lawyer.id,
            clientId: client.id,
          },
          { transaction: t }
        );
      }
    }
    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client,
      user,
    });
  } catch (error) {
    await t.rollback();
    console.log("Error creating client:", error);
    res.status(500).json({
      success: false,
      message: "Error creating client",
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
    await User.destroy({ where: { id: client.userId } });
    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      client: client,
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting client",
    });
  }
};

const getAllClientsOfLawyer = async (req, res) => {
  try {
    let { lawyerId } = req.params;
    const { firmId, role, id: userId } = req.user; // from token

    // If role is Lawyer, automatically set lawyerId
    if (role === "Lawyer") {
      const lawyerRecord = await Lawyer.findOne({
        where: { userId, firmId },
      });
      if (!lawyerRecord) {
        return res.status(404).json({
          success: false,
          message: "Lawyer profile not found for this user",
        });
      }
      lawyerId = lawyerRecord.id;
    }

    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: "Lawyer Id is required",
      });
    }

    // ✅ Fetch unique clients assigned to this lawyer via cases
    const clients = await Client.findAll({
      where: { firmId },
      include: [
        // Clients linked via ClientLawyer (direct lawyer-client relationship)
        {
          model: Lawyer,
          as: "lawyers",
          attributes: ["id", "name", "email"],
          where: { id: lawyerId, firmId },
          through: { attributes: [] }, 
          required: false, 
        },
        // Clients linked via Cases (case-based relationship)
        {
          model: Case,
          as: "cases",
          attributes: ["id", "title", "caseNumber"],
          include: [
            {
              model: Lawyer,
              as: "lawyers",
              attributes: ["id", "name", "email"],
              where: { id: lawyerId, firmId },
              through: { attributes: [] },
            },
          ],
          required: false,
        },
      ],
      distinct: true,
    });

    if (!clients || clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No clients found for this lawyer",
      });
    }

    return res.json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (err) {
    console.error("Get Clients Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getAllClientsOfLawyer,
};
