
const { FirmValidation } = require("../utils/validation");
const { where } = require("sequelize");
const { Lawyer, User, Firm } = require("../models");
const validator = require("validator");
/**create firm API Logic */
const createFirm = async (req, res) => {
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

    const validateFirm = FirmValidation(req, res);
    if (validateFirm) return;

    // ✅ Generate subdomain from firm name (lowercase, replace spaces with '-')
    const subdomain = name.toLowerCase().replace(/\s+/g, "-");
    const existingFirm = await Firm.findOne({ where: { subdomain } });
    if (existingFirm) {
      return res.status(400).json({
        success: false,
        message:
          "Subdomain already taken. Please choose a different firm name.",
      });
    }
    // create a new firm
    const firm = await Firm.create({
      name,
      email,
      phone,
      address,
      subscription_plan,
      max_users,
      max_cases,
      subdomain, // auto-set
    });

     await User.update(
      { firmId: firm.id },
      { where: { id: req.user.id } }
    );
     const updatedUser = await User.findByPk(req.user.id);


    res.status(201).json({
      success: true,
      message: "Firm created successfully",
      newFirm: firm,
      updatedUser,
    }); 
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create firm",
      error: error.message,
    });
  }
};


/**Create Lawyer API */
  const createLawyer = async (req, res) => {
    try {
      const adminId = req.user.id;
      const adminUser = await User.findByPk(adminId);
      if (!adminUser || !adminUser.firmId) {
        return res.status(400).json({
          success: false,
          error: "firm ID not found for the admin",
        });
      }
      const { name, email, phone, specialization, status } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          error: "Name, email, phone is required",
        });
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }
      if (!validator.isMobilePhone(phone + "", "any")) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid phone number" });
      }
        let profileImage = null;
      if (req.file) {
        profileImage = `/uploads/lawyers/${req.file.filename}`;
      }
      const lawyer = await Lawyer.create({
        firmId: adminUser.firmId,
        name,
        email,
        phone,
        specialization,
        status,
        profileImage,
      });
      return res.status(200).json({
        success: true,
        message: "Lawyer create successfully",
        newLawyer: lawyer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating lawyer",
        error: error.message,
      });
    }
  };

const firmStats = async (req, res) => {
  try {
    // If a Super Admin wants to check another firm, pass :id param
    const firmId = req.user.role === "Super Admin" 
      ? Number(req.params.id) 
      : req.user.firmId;   // For Firm Admin, use their own firmId

    if (!firmId) {
      return res.status(400).json({ error: "Firm ID not found" });
    }

    const firm = await Firm.findByPk(firmId);
    if (!firm) return res.status(404).json({ error: "Firm not found" });

    const lawyersCount = await Lawyer.count({ where: { firmId } });
    const clientsCount = await User.count({ where: { firmId, role: "Client" } });
    const totalUsersCount = await User.count({ where: { firmId } });
    const activeLawyersCount = await Lawyer.count({ where: { firmId, status: "Active" } });

    const recentClients = await User.findAll({
      where: { firmId, role: "Client" },
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

    const adminUser = await User.findByPk(adminId);
    if (!adminUser) {
      return res.status(404).json({ success: false, error: "Firm admin not found" });
    }

    if (!adminUser.firmId) {
      return res.status(400).json({ success: false, error: "Firm ID not found for this admin" });
    }

    const lawyers = await Lawyer.findAll({
      where: { firmId: adminUser.firmId },
    });

    if (!lawyers.length) {
      return res.status(404).json({ success: false, error: "No lawyer found in this firm" });
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
    const adminUser = await User.findByPk(adminId);
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

    const adminUser = await User.findByPk(adminId);
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
    const adminUser = await User.findByPk(adminId);
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


module.exports = { createFirm , firmStats, createLawyer, getAllLawyer , getLawyerById , deleteLawyer, updateLawyer};
