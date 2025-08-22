const { sequelize } = require("../models");
const { Firm, User, AdminFirm, Lawyer } = require("../models/index.js");
const { FirmValidation } = require("../utils/validation.js");
const validator = require("validator");

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
    const adminId = req.user.id;

    // Get the firmId linked to this admin
    const adminFirm = await AdminFirm.findOne({
      where: { adminId },
      transaction: t,
    });

    if (!adminFirm) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: "No firm found for this admin",
      });
    }

    const firmId = adminFirm.firmId;

    const { name, email, phone, specialization, status } = req.body;

    // ✅ Validation
    if (!name || !email || !phone) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: "Name, email, and phone are required",
      });
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
        error: "A lawyer with this email already exists in your firm",
      });
    }

    // Handle profile image
    let profileImage = null;
    if (req.file) {
      profileImage = `/uploads/lawyers/${req.file.filename}`;
    }

    //  Create lawyer
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
      firmId = Number(req.params.id); // super admin can check any firm
    } else {
      // for firm admin, resolve from AdminFirm join table
      const adminFirm = await AdminFirm.findOne({
        where: { adminId: req.user.id },
      });
      if (!adminFirm) {
        return res.status(400).json({ error: "Firm not found for this admin" });
      }
      firmId = adminFirm.firmId;
    }

    if (!firmId) {
      return res.status(400).json({ error: "Firm ID not found" });
    }

    const firm = await Firm.findByPk(firmId);
    if (!firm) return res.status(404).json({ error: "Firm not found" });

    // Counts based on new structure
    const lawyersCount = await Lawyer.count({ where: { firmId } });

    // If you also dropped firmId from users, adjust here:
    const clientsCount = await User.count({
      where: { role: "Client" }, // may need to join FirmClient if you use a join table
    });

    const totalUsersCount = await User.count(); // adjust if needed
    const activeLawyersCount = await Lawyer.count({
      where: { firmId, status: "active" }, 
    });

    const recentClients = await User.findAll({
      where: { role: "Client" }, // may need join
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["id", "name", "email", "createdAt"],
    });

    res.json({
      firmId,
      firmName: firm.name,
      lawyersCount,
      clientsCount,
      totalUsersCount,
      activeLawyersCount,
      recentClients,
      stats: {
        totalUsers: totalUsersCount,
        activeUsers: activeLawyersCount + clientsCount,
        inactiveUsers: totalUsersCount - (activeLawyersCount + clientsCount),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch firm stats" });
  }
};


/**Get all Lawyers API */
const getAllLawyer = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const adminUser = await AdminFirm.findOne({
      where: { adminId }
    });
    if (!adminUser) {
      return res
        .status(404)
        .json({ success: false, error: "Firm admin not found" });
    }

    if (!adminUser.firmId) {
      return res
        .status(400)
        .json({ success: false, error: "Firm ID not found for this admin" });
    }

    const lawyers = await Lawyer.findAll({
      where: { firmId: adminUser.firmId },
    });

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
    const adminId = req.user.id;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Id is required",
      });
    }
    const adminUser = await AdminFirm.findOne({
       where: { adminId }
    });
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        error: "firm admin not found",
      });
    }
    const lawyer = await Lawyer.findOne({
      where: { id, firmId: adminUser.firmId },
    });
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: "No lawyer found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "lawyer found successfully",
      lawyer: lawyer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in fetching lawyer",
      error: error.message,
    });
  }
};
/**Update a Lawyers by ID API */
const updateLawyer = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { name, email, phone, specialization, status } = req.body;

    if (!id) {
      return res.status(404).json({
        success: false,
        error: "id is required",
      });
    }

    const adminUser = await await AdminFirm.findOne({
       where: { adminId }
    });
    const lawyer = await Lawyer.findOne({
      where: { id, firmId: adminUser.firmId },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    // If a new profile image is uploaded, build its path
    const profileImage = req.file
      ? `/uploads/lawyers/${req.file.filename}`
      : lawyer.profileImage;

    await lawyer.update({
      name: name ?? lawyer.name,
      email: email ?? lawyer.email,
      phone: phone ?? lawyer.phone,
      specialization: specialization ?? lawyer.specialization,
      status: status ?? lawyer.status,
      profileImage, // 👈 update with new path if available
    });

    return res.status(200).json({
      success: true,
      message: "Lawyer updated successfully",
      updatedLawyer: lawyer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating lawyer",
      error: error.message,
    });
  }
};

/**Delete a Lawyers by ID API */
const deleteLawyer = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Id is required",
      });
    }
    const adminUser = await await AdminFirm.findOne({
       where: { adminId }
    });
    const lawyer = await Lawyer.findOne({
      where: { id, firmId: adminUser.firmId },
    });
    await lawyer.destroy();
    res
      .status(200)
      .json({ success: true, message: "Lawyer deleted successfully" });
    if (!lawyer) {
      return res
        .status(404)
        .json({ success: false, message: "Lawyer not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting lawyer",
      error: error.message,
    });
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
};
