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
    const { status } = req.body;

    const validStatuses = ["Active", "Inactive"]; // match your model ENUM
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const lawyer = await Lawyer.findByPk(id);
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    lawyer.status = status;
    await lawyer.save();

    return res.status(200).json({
      success: true,
      message: `Lawyer status updated to ${status}`,
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
      include : [
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
  getCaseMetadata
};
