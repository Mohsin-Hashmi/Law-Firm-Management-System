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
    console.log(`Looking for Case: ${caseId} Firm (from user): ${firmId}`);
    if (!caseId) {
      return res.status(404).json({
        success: false,
        message: "Case Id is required",
      });
    }
    if (!firmId) {
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

const updateCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const {
      title,
      caseType,
      description,
      clientId,
      lawyerIds,
      status,
      openedAt,
      closedAt,
      documentIdsToRemove,
    } = req.body;

    const firmId = req.user.firmId;

    if (!caseId) {
      return res
        .status(400)
        .json({ success: false, error: "Case ID is required" });
    }

    // === 1. Find Case ===
    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        error: "Case not found or doesn’t belong to this firm",
      });
    }

    // === 2. Validate client (if provided) ===
    if (clientId) {
      const client = await Client.findOne({ where: { id: clientId, firmId } });
      if (!client) {
        return res.status(404).json({
          success: false,
          error: "Client not found or doesn’t belong to this firm",
        });
      }
    }

    // === 3. Update Case Fields ===
    await caseRecord.update({
      title: title ?? caseRecord.title,
      caseType: caseType ?? caseRecord.caseType,
      description: description ?? caseRecord.description,
      clientId: clientId ?? caseRecord.clientId,
      status: status ?? caseRecord.status,
      openedAt: openedAt ?? caseRecord.openedAt,
      closedAt: closedAt ?? caseRecord.closedAt,
    });

    // === 4. Update Lawyers ===
    if (lawyerIds) {
      let lawyerIdArray = [];

      if (Array.isArray(lawyerIds)) {
        lawyerIdArray = lawyerIds
          .map((id) => Number(id))
          .filter((id) => !isNaN(id)); // remove invalid ones
      } else if (typeof lawyerIds === "string") {
        try {
          // case: JSON string like "[1,2]"
          const parsed = JSON.parse(lawyerIds);
          lawyerIdArray = Array.isArray(parsed)
            ? parsed.map((id) => Number(id)).filter((id) => !isNaN(id))
            : [Number(parsed)].filter((id) => !isNaN(id));
        } catch {
          // case: single value string "3"
          const num = Number(lawyerIds);
          if (!isNaN(num)) lawyerIdArray = [num];
        }
      }

      if (lawyerIdArray.length > 0) {
        const lawyers = await Lawyer.findAll({
          where: { id: { [Op.in]: lawyerIdArray }, firmId },
        });

        if (lawyers.length === 0) {
          return res.status(404).json({
            success: false,
            error: "No valid lawyers found for provided IDs",
          });
        }

        await caseRecord.setLawyers(lawyers);
      }
    }

    // === 5. Handle Documents ===
    // (a) Delete selected documents
    if (documentIdsToRemove && Array.isArray(documentIdsToRemove)) {
      await CaseDocument.destroy({
        where: {
          id: { [Op.in]: documentIdsToRemove },
          caseId: caseRecord.id,
        },
      });
    }

    // (b) Add new uploaded documents
    if (req.files && req.files.length > 0) {
      const docs = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        caseId: caseRecord.id,
        uploadedBy: req.user.id,
      }));

      await CaseDocument.bulkCreate(docs);
    }

    // === 6. Fetch updated case with relations ===
    const updatedCase = await Case.findByPk(caseRecord.id, {
      include: [
        { model: Client, as: "client" },
        { model: Lawyer, as: "lawyers" },
        { model: CaseDocument, as: "documents" }, // ✅ include docs
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Case updated successfully",
      case: updatedCase,
    });
  } catch (err) {
    console.error("Update Case Error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
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

const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body; // new status
    const firmId = req.user.firmId;
    if (!caseId) {
      return res
        .status(400)
        .json({ success: false, error: "Case ID is required" });
    }

    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: "Status is required" });
    }

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord) {
      return res.status(404).json({
        success: false,
        error: "Case not found or doesn’t belong to this firm",
      });
    }
    await caseRecord.update({ status });
    return res.status(200).json({
      success: true,
      message: "Case status updated successfully",
      case: caseRecord,
    });
  } catch (err) {
    console.error("Update Case Status Error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// THis api for client dashboard
const getAllCasesOfClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { firmId } = req.user;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client Id is required",
      });
    }
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "Firm Id missing in token",
      });
    }

    const client = await Client.findOne({
      where: { id: clientId, firmId },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found for this firm",
      });
    }

    const cases = await Case.findAll({
      where: { clientId, firmId },
      include: [
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] },
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
      client: { id: client.id, name: client.name },
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
          attributes: ["id", "fullName", "email", "phone", "profileImage"],
        },
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] }, // hide CaseLawyer junction
          attributes: ["id", "name", "email", "profileImage"],
        },
      ],
    });

    if (!cases || cases.length === 0) {
      return res.json({
        success: true,
        count: 0,
        cases: [],
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
    let { lawyerId } = req.params;
    const { firmId, role, id: userId } = req.user; // decoded from token

    // If the logged-in user is a lawyer, auto-set lawyerId
    if (role === "Lawyer") {
      const lawyerRecord = await Lawyer.findOne({ where: { userId, firmId } });
      if (!lawyerRecord) {
        return res.status(404).json({
          success: false,
          message: "Lawyer profile not found for this user",
        });
      }
      lawyerId = lawyerRecord.id; // ✅ assign automatically
    }

    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: "Lawyer Id is required",
      });
    }

    // Fetch all cases for this lawyer in the firm
    const cases = await Case.findAll({
      where: { firmId },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "fullName", "email", "phone"],
          where: { firmId },
        },
        {
          model: Lawyer,
          as: "lawyers",
          through: { attributes: [] },
          attributes: ["id", "name", "email"],
          where: { id: lawyerId, firmId },
        },
        {
          model: CaseDocument,
          as: "documents",
          attributes: ["id", "fileName", "fileType", "filePath", "uploadedBy"],
        },
      ],
    });

    if (!cases || cases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cases found for this lawyer",
      });
    }

    return res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (err) {
    console.error("Error is", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
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
