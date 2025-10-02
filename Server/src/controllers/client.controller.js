const { sequelize } = require("../models");
const {
  Client,
  Lawyer,
  Case,
  User,
  Role,
  UserFirm,
  ClientLawyer,
  CaseDocument,
} = require("../models");
const bcrypt = require("bcryptjs");

/** Helper to get active firm */
const getActiveFirmId = (req) => {
  // Use req.user.activeFirmId if you set it when switching firms from Redux
  return (
    req.user?.activeFirmId || (req.user?.firmIds ? req.user.firmIds[0] : null)
  );
};

/** Create Client API */
const createClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const firmId = getActiveFirmId(req);
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id not found" });

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

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and phone are required",
      });
    }

    // Check duplicate client in this firm
    const existingClient = await Client.findOne({
      where: { email, firmId },
      transaction: t,
    });
    if (existingClient)
      return res.status(400).json({
        success: false,
        message: "Client already exists in this firm",
      });

    // Check duplicate user globally
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    // Find client role
    const clientRole = await Role.findOne({
      where: { name: "Client" },
      transaction: t,
    });
    if (!clientRole)
      return res
        .status(400)
        .json({ success: false, message: "Client role not found" });

    // Create user
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

    // Create user-firm relation
    await UserFirm.create(
      { userId: user.id, firmId, roleId: clientRole.id },
      { transaction: t }
    );

    // Profile image
    const profileImage = req.file
      ? `/uploads/clients/${req.file.filename}`
      : null;

    // Create client
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

    // If logged-in user is a lawyer, create ClientLawyer relation
    if (req.user.role === "Lawyer") {
      const lawyer = await Lawyer.findOne({
        where: { userId: req.user.id, firmId },
        transaction: t,
      });
      if (lawyer)
        await ClientLawyer.create(
          { lawyerId: lawyer.id, clientId: client.id },
          { transaction: t }
        );
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
    console.error("Error creating client:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating client",
      error: error.message,
    });
  }
};

/** Get All Clients API */
const getAllClients = async (req, res) => {
  try {
    const firmId = req.query.firmId || getActiveFirmId(req);
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id not found" });

    const clients = await Client.findAll({
      where: { firmId },
      include: [
        {
          model: Lawyer,
          as: "lawyers",
          attributes: ["id", "name", "email", "phone", "specialization"],
          through: { attributes: [] },
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

    return res
      .status(200)
      .json({ success: true, count: clients.length, clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get clients",
      error: error.message,
    });
  }
};

/** Get Client by ID API */
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getActiveFirmId(req);
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });

    const client = await Client.findOne({
      where: { id, firmId },
      include: [
        { model: Lawyer, as: "lawyers", through: { attributes: [] } },
        { model: Case, as: "cases" },
      ],
    });

    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found in your firm" });

    return res
      .status(200)
      .json({ success: true, message: "Client found successfully", client });
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching client by ID",
      error: error.message,
    });
  }
};

/** Update Client API */
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getActiveFirmId(req);

    const client = await Client.findOne({ where: { id, firmId } });
    if (!client)
      return res.status(404).json({
        success: false,
        message: "Client not found or not part of your firm",
      });

    const profileImage = req.file
      ? `/uploads/clients/${req.file.filename}`
      : undefined;

    const updateData = {
      fullName: req.body.fullName ?? client.fullName,
      dob: req.body.dob ?? client.dob,
      gender: req.body.gender ?? client.gender,
      email: req.body.email ?? client.email,
      phone: req.body.phone ?? client.phone,
      address: req.body.address ?? client.address,
      clientType: req.body.clientType ?? client.clientType,
      organization: req.body.organization ?? client.organization,
      status: req.body.status ?? client.status,
      billingAddress: req.body.billingAddress ?? client.billingAddress,
      outstandingBalance:
        req.body.outstandingBalance ?? client.outstandingBalance,
    };
    if (profileImage) updateData.profileImage = profileImage;

    await client.update(updateData);
    return res
      .status(200)
      .json({ success: true, message: "Client updated successfully", client });
  } catch (error) {
    console.error("Update Client Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
};

/** Delete Client API */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getActiveFirmId(req);

    const client = await Client.findOne({ where: { id, firmId } });
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found in your firm" });

    await client.destroy();
    await User.destroy({ where: { id: client.userId } });

    return res
      .status(200)
      .json({ success: true, message: "Client deleted successfully", client });
  } catch (error) {
    console.error("Delete Client Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error.message,
    });
  }
};

/** Get All Clients of Lawyer API */
const getAllClientsOfLawyer = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role !== "Lawyer") {
      return res.status(403).json({
        success: false,
        message: "Only lawyers can access their clients",
      });
    }

    // 🔹 Find lawyer by logged-in user
    const lawyer = await Lawyer.findOne({ where: { userId } });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer profile not found",
      });
    }

    // 🔹 Use the belongsToMany relation
    const clients = await lawyer.getClients({
      include: [
        {
          model: Case,
          as: "cases",
          required: false, // allow clients without cases
        },
      ],
    });

    if (!clients || clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No clients found for this lawyer",
      });
    }

    return res.status(200).json({
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

/** Client Performance API */
const getClientPerformance = async (req, res) => {
  try {
    const { id: clientId } = req.params;
    const firmId = getActiveFirmId(req);

    const client = await Client.findOne({
      where: { id: clientId, firmId },
      include: [
        {
          model: Case,
          as: "cases",
          include: [
            {
              model: Lawyer,
              as: "lawyers",
              attributes: ["id", "name", "email", "phone", "specialization"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: Lawyer,
          as: "lawyers",
          attributes: ["id", "name", "email", "phone", "specialization"],
          through: { attributes: [] },
        },
      ],
    });

    if (!client) return res.status(404).json({ message: "Client not found" });

    const totalCases = client.cases.length;
    const caseStats = {
      open: client.cases.filter((c) => c.status === "Open").length,
      closed: client.cases.filter((c) => c.status === "Closed").length,
      onHold: client.cases.filter((c) => c.status === "On Hold").length,
      appeal: client.cases.filter((c) => c.status === "Appeal").length,
    };

    const uniqueLawyers = Array.from(
      new Map(
        client.cases.flatMap((c) => c.lawyers).map((l) => [l.id, l])
      ).values()
    );

    return res.json({
      clientId: client.id,
      clientName: client.fullName,
      clientEmail: client.email,
      totalCases,
      caseStats,
      totalLawyersAssigned: uniqueLawyers.length,
      lawyers: uniqueLawyers,
    });
  } catch (error) {
    console.error("Error in client performance:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const clientStats = async (req, res) => {
  try {
    let client;
    let clientId;

    if (req.user.role === "Super Admin" || req.user.role === "Firm Admin") {
      clientId = Number(req.params.id);
      client = await Client.findByPk(clientId, {
        include: [{ model: User, as: "user", attributes: ["name"] }],
      });
    } else if (req.user.role === "Client") {
      client = await Client.findOne({
        where: { userId: req.user.id },
        include: [{ model: User, as: "user", attributes: ["name"] }],
      });
      if (client) clientId = client.id;
    }

    if (!client || !clientId) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Case stats
    const totalCases = await Case.count({ where: { clientId } });
    const activeCases = await Case.count({
      where: { clientId, status: "Open" },
    });
    const completedCases = await Case.count({
      where: { clientId, status: "Closed" },
    });

    // Uploaded documents (join CaseDocument → Case → Client)
    const uploadedDocuments = await CaseDocument.count({
      include: [
        {
          model: Case,
          as: "case",
          where: { clientId },
        },
      ],
    });

    res.json({
      clientId,
      clientName: client.user?.name,
      stats: {
        totalCases,
        activeCases,
        completedCases,
        uploadedDocuments,
      },
    });
  } catch (err) {
    console.error("Client stats error:", err);
    res.status(500).json({
      error: "Failed to fetch client stats",
      details: err.message,
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
  getClientPerformance,
  clientStats,
};
