const { sequelize } = require("../models");
const {
  Firm,
  User,
  AdminFirm,
  Lawyer,
  Client,
  Case,
  CaseLawyer,
  Role
} = require("../models/index.js");
const { FirmValidation } = require("../utils/validation.js");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createFirm = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      name,
      email,
      phone,
      address,
      subscription_plan,
      max_users,
      max_cases,
    } = req.body;

    // Validate input
    const validateFirm = FirmValidation(req, res);
    if (validateFirm) {
      await t.rollback();
      return;
    }

    // Generate unique subdomain
    const subdomain = name.toLowerCase().replace(/\s+/g, "-");
    const existingFirm = await Firm.findOne({ where: { subdomain } });
    if (existingFirm) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Subdomain already taken. Please choose a different firm name.",
      });
    }

    //  Create Firm
    const firm = await Firm.create(
      {
        name,
        email,
        phone,
        address,
        subscription_plan,
        max_users,
        max_cases,
        subdomain,
      },
      { transaction: t }
    );

    //  Link Admin with Firm (new approach, since firmId was removed from users table)
    await AdminFirm.create(
      {
        adminId: req.user.id,
        firmId: firm.id,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Firm created successfully",
      newFirm: firm,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create firm",
      error: error.message,
    });
  }
};

/** Create Lawyer API */
const createLawyer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { firmId: firmIdParam } = req.params;

    // Convert firmId to number and validate
    const firmId = parseInt(firmIdParam, 10);
    if (isNaN(firmId)) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Invalid or missing firmId" });
    }

    const { name, email, phone, specialization, status } = req.body;

    // Validation
    if (!name || !email || !phone) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Name, email, and phone are required" });
    }
    if (!validator.isEmail(email)) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Invalid email format" });
    }
    if (!validator.isMobilePhone(phone.toString(), "any")) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number" });
    }

    // Prevent duplicate lawyers in the same firm
    const existingLawyer = await Lawyer.findOne({
      where: { email, firmId },
      transaction: t,
    });
    if (existingLawyer) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: "A lawyer with this email already exists in this firm",
      });
    }

    // Handle profile image
    let profileImage = null;
    if (req.file) profileImage = `/uploads/lawyers/${req.file.filename}`;

    // Create lawyer
    const lawyer = await Lawyer.create(
      {
        firmId,
        name,
        email,
        phone,
        specialization,
        status: status || "active",
        profileImage,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Lawyer created successfully",
      newLawyer: lawyer,
    });
  } catch (error) {
    await t.rollback();
    console.log("Error in creating lawyer:", error);
    res.status(500).json({
      success: false,
      message: "Error creating lawyer",
      error: error.message,
    });
  }
};

const firmStats = async (req, res) => {
  try {
    let firmId;

    if (req.user.role === "Super Admin") {
      // Super Admin can check any firm by id in the URL
      firmId = Number(req.params.id);
    } else {
      // Firm Admin → either from params or from AdminFirm join table
      if (req.params.id) {
        firmId = Number(req.params.id);
      } else {
        const adminFirm = await AdminFirm.findOne({
          where: { adminId: req.user.id },
        });
        if (!adminFirm) {
          return res
            .status(400)
            .json({ error: "Firm not found for this admin" });
        }
        firmId = adminFirm.firmId;
      }
    }

    if (!firmId) {
      return res.status(400).json({ error: "Firm ID not provided" });
    }

    const firm = await Firm.findByPk(firmId);
    if (!firm) return res.status(404).json({ error: "Firm not found" });

    // Counts
    const lawyersCount = await Lawyer.count({ where: { firmId } });
    const clientsCount = await Client.count({ where: { firmId }});
    const totalCasesCount = await Case.count({ where: { firmId } });
    const activeLawyersCount = await Lawyer.count({
      where: { firmId, status: "active" },
    });

    // Recent clients
    const recentClients = await Client.findAll({
      where: { firmId },
    });

    res.json({
      firmId,
      firmName: firm.name,
      lawyersCount,
      clientsCount,
      totalCasesCount,
      activeLawyersCount,
      recentClients,
      stats: {
        totalUsers: lawyersCount + clientsCount,
        activeUsers: activeLawyersCount + clientsCount,
        inactiveUsers: Math.max(
          0,
          lawyersCount + clientsCount - (activeLawyersCount + clientsCount)
        ),
      },
    });
  } catch (err) {
    console.error("Firm stats error:", err);
    res.status(500).json({ error: "Failed to fetch firm stats", details: err.message });
  }
};
/** Get all Lawyers API */
const getAllLawyer = async (req, res) => {
  try {
    let firmId = req.query.firmId; // get from query (e.g. /lawyers?firmId=2)

    // fallback to firmId from logged-in admin if not passed
    if (!firmId) {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const adminUser = await AdminFirm.findOne({ where: { adminId } });
      if (!adminUser || !adminUser.firmId) {
        return res
          .status(404)
          .json({ success: false, error: "Firm not found for this admin" });
      }

      firmId = adminUser.firmId;
    }

    // fetch lawyers by firmId
    const lawyers = await Lawyer.findAll({ where: { firmId } });

    if (!lawyers.length) {
      return res
        .status(404)
        .json({ success: false, error: "No lawyer found in this firm" });
    }

    return res.status(200).json({
      success: true,
      allLawyers: lawyers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in fetching lawyers",
      error: error.message,
    });
  }
};

/**Get a Lawyers by ID API */
const getLawyerById = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT
    const adminFirmId = req.user.firmId; // from JWT
    console.log("logged in user is ", adminId, "with firmId:", adminId);

    const lawyerId = Number(req.params.id);
    if (!req.params.id || isNaN(lawyerId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing lawyer ID",
      });
    }

    // Fetch lawyer
    const lawyer = await Lawyer.findOne({ where: { id: lawyerId } });
    if (!lawyer) {
      return res
        .status(404)
        .json({ success: false, error: "Lawyer not found" });
    }

    console.log("Lawyer firmId:", lawyer.firmId);

    // Check if admin belongs to the same firm
    if (Number(lawyer.firmId) !== Number(adminFirmId)) {
      return res.status(403).json({
        success: false,
        error: "Admin not allowed to access this lawyer",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lawyer found successfully",
      lawyer,
    });
  } catch (error) {
    console.error("Error fetching lawyer:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching lawyer",
      error: error.message,
    });
  }
};
/**Update a Lawyers by ID API */
const updateLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "Id is required" });
    }

    // Get firmId from JWT
    const firmId = req.user.firmId;

    // Find lawyer by id and firmId (ensures admin only updates their own firm's lawyer)
    const lawyer = await Lawyer.findOne({ where: { id, firmId } });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found or not part of your firm",
      });
    }

    const profileImage = req.file
      ? `/uploads/lawyers/${req.file.filename}`
      : lawyer.profileImage;

    await lawyer.update({
      name: name ?? lawyer.name,
      email: email ?? lawyer.email,
      phone: phone ?? lawyer.phone,
      specialization: specialization ?? lawyer.specialization,
      status: status ?? lawyer.status,
      profileImage,
    });

    return res.status(200).json({
      success: true,
      message: "Lawyer updated successfully",
      updatedLawyer: lawyer,
    });
  } catch (error) {
    console.error("Update Lawyer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating lawyer",
      error: error.message,
    });
  }
};

/**Delete a Lawyers by ID API */
const deleteLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const adminRole = req.user.role;
    const firmIdFromToken = req.user.firmId;

    if (!id)
      return res.status(400).json({ success: false, error: "Id is required" });

    const lawyer = await Lawyer.findOne({ where: { id } });
    if (!lawyer)
      return res
        .status(404)
        .json({ success: false, message: "Lawyer not found" });

    let allowedFirmIds = [];

    if (adminRole === "Super Admin") {
      const adminFirms = await AdminFirm.findAll({ where: { adminId } });
      allowedFirmIds = adminFirms.map((f) => f.firmId);
    } else if (adminRole === "Firm Admin") {
      allowedFirmIds = [firmIdFromToken];
    }

    // if (!allowedFirmIds.includes(lawyer.firmId)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Admin not allowed to delete this lawyer",
    //   });
    // }

    await lawyer.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Lawyer deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting lawyer",
      error: error.message,
    });
  }
};

// switch firm api

const switchFirm = async (req, res) => {
  try {
    const { firmId } = req.body;
    const userId = req.user.id; // your auth middleware should populate req.user

    // verify user has access to this firm
    const adminFirm = await AdminFirm.findAll({
      where: { adminId: userId, firmId },
    });
    if (!adminFirm) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // create new token with updated firmId
    const token = jwt.sign(
      { id: userId, role: req.user.role, firmId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, currentFirmId: firmId, token });
  } catch (err) {
    console.error("switchFirm error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

//lawyer performance api
const getLawyerPerformance = async (req, res) => {
  try {
    const { id: lawyerId } = req.params;

    const lawyer = await Lawyer.findByPk(lawyerId, {
      include: [
        {
          model: Case,
          as: "cases",
          through: { attributes: [] },
        },
      ],
    });

    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    // Performance stats
    const totalCases = lawyer.cases.length;
    const completedCases = lawyer.cases.filter(
      (c) => c.status === "Closed"
    ).length;
    const activeCases = lawyer.cases.filter((c) => c.status === "Open").length;
    const wonCases = lawyer.cases.filter((c) => c.status === "Won").length;
    const lostCases = lawyer.cases.filter((c) => c.status === "Lost").length;

    const successRate = totalCases > 0 ? (wonCases / totalCases) * 100 : 0;

    return res.json({
      lawyerId,
      name: lawyer.name,
      totalCases,
      completedCases,
      activeCases,
      wonCases,
      lostCases,
      successRate,
    });
  } catch (error) {
    console.error("Error in performace is", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createFirm,
  firmStats,
  createLawyer,
  getAllLawyer,
  getLawyerById,
  deleteLawyer,
  updateLawyer,
  switchFirm,
  getLawyerPerformance,
};
