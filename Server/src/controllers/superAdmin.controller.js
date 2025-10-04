const { Firm, Lawyer, Client, Case, sequelize } = require("../models");
const { FirmValidation } = require("../utils/validation");
const validator = require("validator");
const { Op, fn, col } = require("sequelize");

/**get all firm API Logic */
const getAllFirms = async (req, res) => {
  try {
    const firms = await Firm.findAll();
    if (!firms || firms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Firm found in your platform",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Firms fetched successfully",
      firms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch firms",
      error: error.message,
    });
  }
};
/**get a firm by id API Logic */
const getFirmById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: "Valid firm ID must be provided",
      });
    }
    const firm = await Firm.findByPk(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: "Firm not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Firm fetched successfully",
      firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch firms",
      error: error.message,
    });
  }
};

/**Update Firm Status API */
const updateFirmStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["active", "suspended", "terminated"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }
    const firm = await Firm.findByPk(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        message: "Firm not found",
      });
    }
    firm.status = status;
    await firm.save();
    return res.status(200).json({
      success: true,
      message: `Firm status updated to ${status}`,
      firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update the frim status",
      error: error.message,
    });
  }
};

/**Update Firm Subscription Plan API */
const updateFirmSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription_plan, max_users, max_cases } = req.body;

    // validate subscription plan
    const validPlans = ["Free", "Basic", "Premium"];
    if (subscription_plan && !validPlans.includes(subscription_plan)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription plan. Must be one of: ${validPlans.join(
          ", "
        )}`,
      });
    }

    const firm = await Firm.findByPk(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        message: "Firm not found",
      });
    }

    // Update only provided fields
    if (subscription_plan !== undefined)
      firm.subscription_plan = subscription_plan;
    if (max_users !== undefined) firm.max_users = max_users;
    if (max_cases !== undefined) firm.max_cases = max_cases;

    await firm.save();

    return res.status(200).json({
      success: true,
      message: "Firm subscription updated successfully",
      firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update firm subscription",
      error: error.message,
    });
  }
};
/**delete a firm by id API Logic */
const deleteFirm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: "Valid firm ID must be provided",
      });
    }
    const firm = await Firm.findByPk(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: "Firm not found",
      });
    }
    await firm.destroy();
    return res.status(200).json({
      success: true,
      message: "Firm deleted successfully",
      deletedFirm: firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete firm",
      error: error.message,
    });
  }
};

const getPlatformOverview = async (req, res) => {
  try {
    const totalFirms = await Firm.count();
    const totalLawyer = await Lawyer.count();
    const totalClients = await Client.count();
    const totalCases = await Case.count();

    // count how many firms are in each plan
    const planDistribution = await Firm.findAll({
      attributes: [
        "subscription_plan",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["subscription_plan"],
    });

    // format the results into { Free: x, Basic: y, Premium: z }
    const distribution = { Free: 0, Basic: 0, Premium: 0 };
    planDistribution.forEach((row) => {
      distribution[row.subscription_plan] = Number(row.dataValues.count);
    });

    res.status(200).json({
      totalFirms,
      totalLawyer,
      totalClients,
      totalCases,
      planDistribution: distribution,
    });
  } catch (error) {
    console.error("Error fetching super admin overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Lawyer Management APIs For Super Admin
 */

const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.findAll({
      include: [
        {
          model: Firm,
          as: "firm",
          attributes: ["id", "name", "subscription_plan"],
        },
      ],
    });
    if (!lawyers || lawyers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No lawyer found in the platform",
      });
    }
    const totalCount = lawyers.length;
    return res.status(200).json({
      success: true,
      message: "Lawyers fetch successfully",
      totalLawyers: totalCount,
      lawyers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lawyers",
      error: error.message,
    });
  }
};

const getLawyerById = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyer = await Lawyer.findByPk(id, {
      include: [{ model: Firm, as: "firm", attributes: ["id", "name"] }],
    });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lawyer fetch successfully",
      lawyer,
    });
  } catch (error) {
    console.error("Error fetching lawyer by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lawyer",
      error: error.message,
    });
  }
};

const deleteLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyer = await Lawyer.findByPk(id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    await lawyer.destroy();

    return res.status(200).json({
      success: true,
      message: "Lawyer deleted successfully",
      deletedLawyer: lawyer,
    });
  } catch (error) {
    console.error("Error deleting lawyer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lawyer",
      error: error.message,
    });
  }
};

const updateLawyerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Normalize casing and trim
    status = status.trim().toLowerCase();

    const validStatuses = ["active", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: Active, Inactive",
      });
    }

    // Capitalize for DB consistency
    const formattedStatus = status === "active" ? "Active" : "Inactive";

    const lawyer = await Lawyer.findByPk(id);
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    lawyer.status = formattedStatus;
    await lawyer.save();

    return res.status(200).json({
      success: true,
      message: `Lawyer status updated to ${formattedStatus}`,
      lawyer,
    });
  } catch (error) {
    console.error("Error updating lawyer status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lawyer status",
      error: error.message,
    });
  }
};


/**
 * Client Management APIs For Super Admin
 */

const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [
        {
          model: Firm,
          as: "firm",
          attributes: ["id", "name", "subscription_plan"],
        },
      ],
    });
    if (!clients || clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No clients found for this platform",
      });
    }
    const totalCount = clients.length;
    return res.status(200).json({
      success: true,
      message: "Client fetched successfully",
      totalClients: totalCount,
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid client ID must be provided",
      });
    }

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Firm,
          as: "firm",
          attributes: ["name", "email"],
        },
      ],
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client fetched successfully",
      client,
    });
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch client",
      error: error.message,
    });
  }
};
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid client ID must be provided",
      });
    }

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Firm,
          as: "firm",
          attributes: ["name", "email"]
        }
      ]
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    await client.destroy();

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      deletedClient: client,
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

/** 🔵 Super Admin Client Performance API */
const getClientPerformanceSuperAdmin = async (req, res) => {
  try {
    const { id: clientId } = req.params;

    //  No firm filter here, Super Admin can access any client
    const client = await Client.findOne({
      where: { id: clientId },
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

    if (!client)
      return res.status(404).json({ message: "Client not found" });

    // Calculate performance metrics
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
    console.error("Error in super admin client performance:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    // Validate required field
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Normalize input
    status = status.trim().toLowerCase();

    // Allowed statuses (must match ENUM in model)
    const validStatuses = ["active", "past", "potential", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(", ")}`,
      });
    }

    // Capitalize first letter for DB consistency
    const formattedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Find client
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Update and save
    client.status = formattedStatus;
    await client.save();

    return res.status(200).json({
      success: true,
      message: `Client status updated to ${formattedStatus}`,
      client,
    });
  } catch (error) {
    console.error(" Error updating client status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update client status",
      error: error.message,
    });
  }
};


/**
 * Showing Cases metadata APIs
 */
const getCaseMetadata = async (req, res) => {
  try {
    // Total cases
    const totalCases = await Case.count();

    // Cases by status
    const casesByStatus = await Case.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("Case.id")), "count"],
      ],
      group: ["status"],
    });

    // Cases opened per month (MySQL friendly)
    const casesByMonth = await Case.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("Case.openedAt"), "%Y-%m"), "month"],
        [sequelize.fn("COUNT", sequelize.col("Case.id")), "count"],
      ],
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("Case.openedAt"), "%Y-%m")],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("Case.openedAt"), "%Y-%m"), "ASC"]],
    });

    // Cases grouped by firm
    const firmWiseCases = await Case.findAll({
      attributes: [
        "firmId",
        [sequelize.fn("COUNT", sequelize.col("Case.id")), "count"],
      ],
      group: ["firmId"],
      include: [
        { model: Firm, as: "firm", attributes: ["id", "name"] },
      ],
    });

    res.status(200).json({
      success: true,
      totalCases,
      casesByStatus,
      casesByMonth,
      firmWiseCases,
    });
  } catch (error) {
    console.error("Error fetching case metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch case metadata",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFirms,
  getFirmById,
  updateFirmStatus,
  updateFirmSubscription,
  getPlatformOverview,
  deleteFirm,
  getAllLawyers,
  getLawyerById,
  deleteLawyer,
  updateLawyerStatus,
  getAllClients,
  getClientById,
  deleteClient,
  getClientPerformanceSuperAdmin,
  updateClientStatus,
  getCaseMetadata
};
