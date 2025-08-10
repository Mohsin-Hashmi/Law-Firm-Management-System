const { Firm } = require("../models");
const { FirmValidation } = require("../utils/validation");
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
      status,
      billing_info,
      trial_ends_at,
    } = req.body;

    const validateFirm = FirmValidation(req, res);
    if (validateFirm) return;
    // create a new firm
    const firm = await Firm.create({
      name,
      email,
      phone,
      address,
      subscription_plan,
      max_users,
      max_cases,
      status,
      billing_info,
      trial_ends_at,
    });
    res.status(201).json({
      success: true,
      message: "Firm created successfully",
      newFirm: firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create firm",
      error: error.message,
    });
  }
};
/**get all firm API Logic */
const getAllFirms = async (req, res) => {
  try {
    const allFirms = await Firm.findAll();
    return res.status(200).json({
      success: true,
      message: "Firms fetched successfully",
      firms: allFirms,
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
    if (!id) {
      return res.status(404).json({
        success: false,
        error: "Id not provided",
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
      firm: firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch firms",
      error: error.message,
    });
  }
};

const updateFirm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        error: "Id not provided",
      });
    }
    const firm = await Firm.findByPk(id);
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: "Firm not found",
      });
    }
    const {
      name,
      email,
      phone,
      address,
      subscription_plan,
      max_users,
      max_cases,
      status,
      billing_info,
      trial_ends_at,
    } = req.body;

    if (email !== undefined && !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Email format is invalid",
      });
    }

    if (phone !== undefined && !validator.isMobilePhone(String(phone), "any")) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Update fields only if they are provided
    firm.name = name ?? firm.name;
    firm.email = email ?? firm.email;
    firm.phone = phone ?? firm.phone;
    firm.address = address ?? firm.address;
    firm.subscription_plan = subscription_plan ?? firm.subscription_plan;
    firm.max_users = max_users ?? firm.max_users;
    firm.max_cases = max_cases ?? firm.max_cases;
    firm.status = status ?? firm.status;
    firm.billing_info = billing_info ?? firm.billing_info;
    firm.trial_ends_at = trial_ends_at ?? firm.trial_ends_at;

    await firm.save();
    return res.status(200).json({
      success: true,
      message: "Firm updated successfully",
      updatedFirm: firm,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update firm",
      error: error.message,
    });
  }
};
/**delete a firm by id API Logic */
const deleteFirm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        error: "Id not provided",
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

module.exports = {
  createFirm,
  getAllFirms,
  getFirmById,
  updateFirm,
  deleteFirm,
};
