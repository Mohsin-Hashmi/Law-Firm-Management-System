const { where } = require("sequelize");
const { Lawyer, User, Firm } = require("../models");


/**Get all Lawyers API */
const getAllLawyer = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminUser = await User.findByPk(adminId);
    if (!adminUser) {
      return res.status(400).json({
        success: false,
        error: "firm admin not found",
      });
    }
    const lawyers = await Lawyer.findAll({
      where: { firmId: adminUser.firmId },
    });
    if (!lawyers) {
      return res.status(400).json({
        success: false,
        error: "No lawyer found in this law firm",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All lawyers fetched successfully",
      allLawyers: lawyers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in fetching lawyer",
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
    await lawyer.update({
      name: name ?? lawyer.name,
      email: email ?? lawyer.email,
      phone: phone ?? lawyer.phone,
      specialization: specialization ?? lawyer.specialization,
      status: status ?? lawyer.status,
    });
    return res.status(200).json({
      success: true,
      message: "Lawyer updated successfully",
      updatedLawyer: lawyer,
    });
  } catch (error) {
    res
      .status(500)
      .json({
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

module.exports = {
  getAllLawyer,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
};
