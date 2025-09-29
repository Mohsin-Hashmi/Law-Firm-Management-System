const dotenv = require("dotenv");
dotenv.config();
const { sequelize } = require("../models");
const {
  Firm,
  User,
  AdminFirm,
  Lawyer,
  Client,
  UserFirm,
  Case,
  CaseLawyer,
  Role,
} = require("../models/index.js");
const { FirmValidation } = require("../utils/validation.js");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { where } = require("sequelize");

const getActiveFirmId = (req) => {
  if (req.user?.firmId) {
    return req.user.firmId;
  }

  if (req.user?.activeFirmId) {
    return req.user.activeFirmId;
  }

  if (Array.isArray(req.user?.firmIds) && req.user.firmIds.length > 0) {
    return req.user.firmIds[0];
  }

  return null;
};

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

// Get Firm Detail API

const getAllMyFirmsDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const firms = await Firm.findAll({
      include: [
        {
          model: AdminFirm,
          as: "adminFirms",
          where: { adminId: userId },
          attributes: [],
        },
      ],
      attributes: ["id", "name", "subscription_plan", "phone"],
    });

    if (!firms.length) {
      return res.status(404).json({
        success: false,
        message: "No firms found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      firms,
    });
  } catch (error) {
    console.error("Error fetching all firm details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch firm details",
      error: error.message,
    });
  }
};

// Delete Firm API
const deleteFirm = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firmId } = req.body; // get firmId from body

    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "firmId is required",
      });
    }

    // Check if this admin owns the firm
    const adminFirm = await AdminFirm.findOne({
      where: { adminId: userId, firmId },
    });

    if (!adminFirm) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this firm",
      });
    }

    // Delete relation + firm
    await AdminFirm.destroy({ where: { firmId } });
    await Firm.destroy({ where: { id: firmId } });

    return res.status(200).json({
      success: true,
      message: "Firm deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting firm:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete firm",
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
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    // Handle profile image
    let profileImage = null;
    if (req.file) profileImage = `/uploads/lawyers/${req.file.filename}`;

    // Find Laywer Role
    const lawyerRole = await Role.findOne({
      where: { name: "Lawyer" },
      transaction: t,
    });
    if (!lawyerRole) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: "Lawyer role not found",
      });
    }

    const hashedPassword = await bcrypt.hash(process.env.DUMMY_PASSWORD, 10);
    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        roleId: lawyerRole.id,
        mustChangePassword: true,
      },
      { transaction: t }
    );

    //Create user-firm relation
    await UserFirm.create(
      {
        userId: user.id,
        firmId,
        roleId: lawyerRole.id,
      },
      {
        transaction: t,
      }
    );
    // Create lawyer
    const lawyer = await Lawyer.create(
      {
        firmId,
        userId: user.id,
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
      user: user,
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
    const clientsCount = await Client.count({ where: { firmId } });
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
    res
      .status(500)
      .json({ error: "Failed to fetch firm stats", details: err.message });
  }
};
/** Get all Lawyers API */
const getAllLawyer = async (req, res) => {
  try {
    let firmId = req.query.firmId || getActiveFirmId(req);

    if (!firmId) {
      return res
        .status(400)
        .json({ success: false, message: "Firm ID not found" });
    }

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

/** Get a Lawyer by ID API */
const getLawyerById = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT
    const activeFirmId = getActiveFirmId(req);

    console.log(
      "Logged in user:",
      adminId,
      "with active firm ID:",
      activeFirmId
    );

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

    // Check if admin's active firm matches lawyer's firm
    if (lawyer.firmId !== activeFirmId) {
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

/** Update a Lawyer by ID API */
const updateLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, status } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "Id is required" });
    }

    const activeFirmId = getActiveFirmId(req);

    if (!activeFirmId) {
      return res.status(403).json({
        success: false,
        error: "No active firm assigned to your account",
      });
    }

    // Find lawyer by id and ensure they belong to admin's active firm
    const lawyer = await Lawyer.findOne({
      where: { id, firmId: activeFirmId },
    });

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

/** Delete a Lawyer by ID API */
const deleteLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const adminRole = req.user.role;
    const activeFirmId = getActiveFirmId(req);

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
    } else if (adminRole === "Firm Admin" && activeFirmId) {
      allowedFirmIds = [activeFirmId];
    }

    if (!allowedFirmIds.includes(lawyer.firmId)) {
      return res.status(403).json({
        success: false,
        message: "Admin not allowed to delete this lawyer",
      });
    }

    const userId = lawyer.userId;
    await lawyer.destroy();
    if (userId) {
      await User.destroy({ where: { id: userId } });
    }
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
    const userId = req.user.id;

    // verify user has access
    const adminFirm = await AdminFirm.findOne({
      where: { adminId: userId, firmId },
    });
    if (!adminFirm) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // fetch all firmIds for this admin
    const allAdminFirms = await AdminFirm.findAll({
      where: { adminId: userId },
    });
    const firmIds = allAdminFirms.map((f) => f.firmId);
    const roleRecord = await Role.findOne({
      where: { firmId }, // firm specific role
    });
    const userRole = roleRecord ? roleRecord.name : null;

    // sign token with firmId + firmIds
    const token = jwt.sign(
      { id: userId, role: req.user.role, firmId, firmIds },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, currentFirmId: firmId, userRole, token });
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

const lawyerStats = async (req, res) => {
  try {
    let lawyer; // declare once
    let lawyerId;

    if (req.user.role === "Super Admin" || req.user.role === "Firm Admin") {
      // Admin can fetch any lawyer stats
      lawyerId = Number(req.params.id);
      lawyer = await Lawyer.findByPk(lawyerId);
    } else if (req.user.role === "Lawyer") {
      // Logged-in lawyer → find by userId
      lawyer = await Lawyer.findOne({
        where: { userId: req.user.id },
        include: [{ model: User, as: "user", attributes: ["name"] }],
      });
      if (lawyer) lawyerId = lawyer.id;
    }

    if (!lawyer || !lawyerId) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    // ✅ Case stats
    const completedCasesCount = await Case.count({
      include: [{ model: Lawyer, as: "lawyers", where: { id: lawyerId } }],
      where: { status: "Closed" },
    });

    const ongoingCasesCount = await Case.count({
      include: [{ model: Lawyer, as: "lawyers", where: { id: lawyerId } }],
      where: { status: "Open" },
    });

    const pendingCasesCount = await Case.count({
      include: [{ model: Lawyer, as: "lawyers", where: { id: lawyerId } }],
      where: { status: "On Hold" },
    });

    const appealCasesCount = await Case.count({
      include: [{ model: Lawyer, as: "lawyers", where: { id: lawyerId } }],
      where: { status: "Appeal" },
    });

    // ✅ Active clients linked to this lawyer
    const activeClientsCount = await Client.count({
      include: [{ model: Lawyer, as: "lawyers", where: { id: lawyerId } }],
      where: { status: "Active" },
      distinct: true,
    });

    res.json({
      lawyerId,
      lawyerName: lawyer.user?.name,
      stats: {
        completedCases: completedCasesCount,
        ongoingCases: ongoingCasesCount,
        pendingCases: pendingCasesCount,
        appealCases: appealCasesCount,
        activeClients: activeClientsCount,
      },
    });
  } catch (err) {
    console.error("Lawyer stats error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch lawyer stats", details: err.message });
  }
};

module.exports = {
  createFirm,
  getAllMyFirmsDetails,
  deleteFirm,
  firmStats,
  createLawyer,
  getAllLawyer,
  getLawyerById,
  deleteLawyer,
  updateLawyer,
  switchFirm,
  getLawyerPerformance,
  lawyerStats,
};
