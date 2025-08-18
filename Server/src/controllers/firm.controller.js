
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
    const firmId = Number(req.params.id);

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


module.exports = { createFirm , firmStats, createLawyer };
