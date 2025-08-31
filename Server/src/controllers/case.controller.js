const { Case, Client, Firm, Lawyer, CaseDocument } = require("../models");
const { Op, where } = require("sequelize");

const createCase = async (req, res) => {
  try {
    const { title, caseNumber, caseType, description, clientId, lawyerIds } =
      req.body;

    const firmId = req.user.firmId;

    const firm = await Firm.findByPk(firmId);
    if (!firm) {
      return res.status(404).json({ success: false, error: "Firm not found" });
    }
    const client = await Client.findOne({ where: { id: clientId, firmId } });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Client not found or doesn’t belong to this firm",
      });
    }

    const existingCase = await Case.findOne({ where: { caseNumber, firmId } });
    if (existingCase) {
      return res.status(400).json({
        success: false,
        error: "Case number already exists for this firm",
      });
    }

    const newCase = await Case.create({
      title,
      caseNumber,
      caseType,
      description,
      firmId,
      clientId,
    });

    if (lawyerIds && lawyerIds.length > 0) {
      let lawyerIdArray = lawyerIds;
      if (!Array.isArray(lawyerIds)) {
        lawyerIdArray = [Number(lawyerIds)];
      } else {
        lawyerIdArray = lawyerIds.map((id) => Number(id));
      }

      const lawyers = await Lawyer.findAll({
        where: { id: { [Op.in]: lawyerIdArray }, firmId },
      });

      if (lawyers.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No valid lawyers found for provided IDs",
        });
      }

      await newCase.addLawyers(lawyers);
    }

    if (req.files && req.files.length > 0) {
      const docs = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        caseId: newCase.id,
        uploadedBy: req.user.id,
      }));

      await CaseDocument.bulkCreate(docs);
    }

    const createdCase = await Case.findByPk(newCase.id, {
      include: [
        { model: Client, as: "client" }, // alias must match
        { model: Lawyer, as: "lawyers" }, // alias must match
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: createdCase,
    });
  } catch (err) {
    console.error("Create Case Error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;
    const firmId = req.user.firmId;
    if (!caseId) {
      return res.status(404).json({
        success: false,
        message: "Case Id is required",
      });
    }
    if(!firmId){
      return res.status(404).json({
        success: false,
        message: "Firm Id is required",
      });
    }
    const caseData = await Case.findOne({
      where: { id: caseId, firmId },
      include: [
        {
          model: Client,
          as: "client",
        },
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] },
        },
        {
          model: CaseDocument,
          as: "documents", 
        },
      ],
    });
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }
    return res.json({
      success: true,
      case: caseData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get case details",
      error: err.message,
    });
  }
};

//pending
const updateCase = async (req, res) => {
  try {
  } catch (err) {}
};

const deleteCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const firmId = req.user?.firmId;
    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: "Case Id is required",
      });
    }
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Frim Id is required",
      });
    }
    const caseData = await Case.findOne({
      where: {
        id: caseId,
        firmId,
      },
    });
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found for this firm",
      });
    }
    await Case.destroy({
      where: { id: caseId },
    });
    return res.json({
      success: true,
      message: "Case deleted successfully",
      case: caseData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// pending
const updateCaseStatus = async (req, res) => {
  try {
  } catch (err) {}
};

// THis api for client dashboard
const getAllCasesOfClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { firmId } = req.params;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client Id is required",
      });
    }
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Frim Id is required",
      });
    }
    const client = await Client.findOne({
      where: {
        id: clientId,
        firmId,
      },
    });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found for this firm",
      });
    }
    const cases = await Case.findAll({
      where: {
        clientId,
        firmId,
      },
      include: [
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] }, // hide junction table
          attributes: ["id", "name", "email"],
        },
      ],
    });
    if (!cases || cases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cases found for this client",
      });
    }
    return res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
      },
      cases,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getAllCasesOfFirm = async (req, res) => {
  try {
    const { firmId } = req.params;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Frim Id is required",
      });
    }
    // Fetch all cases of the firm
    const cases = await Case.findAll({
      where: { firmId },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "fullName", "email", "phone"],
        },
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] }, // hide CaseLawyer junction
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!cases || cases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cases found for this firm",
      });
    }

    return res.json({
      success: true,
      count: cases.length,
      cases: cases,
    });
  } catch (err) {
    console.log("Error is", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// This API is for lawyer dashboard
const getAllCasesOfLawyer = async (req, res) => {
  try {
  } catch (err) {}
};

/**
 * Case Document APIs
 */

const addDocumentsByCase = async (req, res) => {
  try {
  } catch (err) {}
};

const getAllDocumentsByCase = async (req, res) => {
  try {
  } catch (err) {}
};

const getOneDocumentOfCase = async (req, res) => {
  try {
  } catch (err) {}
};

const deleteDocumentOfCase = async (req, res) => {
  try {
  } catch (err) {}
};

module.exports = {
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
  updateCaseStatus,
  getAllCasesOfClient,
  getAllCasesOfFirm,
  getAllCasesOfLawyer,
  addDocumentsByCase,
  getAllDocumentsByCase,
  getOneDocumentOfCase,
  deleteDocumentOfCase,
};
