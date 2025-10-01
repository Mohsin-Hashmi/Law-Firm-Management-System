const { Case, Client, Firm, Lawyer, CaseDocument } = require("../models");
const { Op } = require("sequelize");

const getActiveFirmId = (req) => {
  return (
    req.user?.activeFirmId || (req.user?.firmIds ? req.user.firmIds[0] : null)
  );
};

const createCase = async (req, res) => {
  try {
    const { title, caseNumber, caseType, description, clientId, lawyerIds } =
      req.body;
    const firmId = getActiveFirmId(req);

    if (!firmId)
      return res
        .status(400)
        .json({ success: false, error: "Firm Id not found" });

    const firm = await Firm.findByPk(firmId);
    if (!firm)
      return res.status(404).json({ success: false, error: "Firm not found" });

    const client = await Client.findOne({ where: { id: clientId, firmId } });
    if (!client)
      return res.status(404).json({
        success: false,
        error: "Client not found or doesn’t belong to this firm",
      });

    const existingCase = await Case.findOne({ where: { caseNumber, firmId } });
    if (existingCase)
      return res.status(400).json({
        success: false,
        error: "Case number already exists for this firm",
      });

    const newCase = await Case.create({
      title,
      caseNumber,
      caseType,
      description,
      firmId,
      clientId,
    });

    // Assign logged-in lawyer if role is Lawyer
    if (req.user.role === "Lawyer") {
      const lawyer = await Lawyer.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (lawyer) await newCase.addLawyer(lawyer);
    }

    // Assign additional lawyers
    if (lawyerIds && lawyerIds.length > 0) {
      const lawyerIdArray = Array.isArray(lawyerIds)
        ? lawyerIds.map(Number)
        : [Number(lawyerIds)];
      const lawyers = await Lawyer.findAll({
        where: { id: { [Op.in]: lawyerIdArray }, firmId },
      });
      if (lawyers.length > 0) await newCase.addLawyers(lawyers);
    }

    // Attach documents
    if (req.files && req.files.length > 0) {
      const docs = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        caseId: newCase.id,
        uploadedById: req.user.id,
        uploadedByType: req.user.role, // "Lawyer", "Client", or "Firm Admin"
      }));
      await CaseDocument.bulkCreate(docs);
    }

    const createdCase = await Case.findByPk(newCase.id, {
      include: [
        { model: Client, as: "client" },
        { model: Lawyer, as: "lawyers" },
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

// ==================== GET CASE BY ID ====================
const getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!caseId)
      return res
        .status(404)
        .json({ success: false, message: "Case Id is required" });
    if (!firmId)
      return res
        .status(404)
        .json({ success: false, message: "Firm Id is required" });

    const caseData = await Case.findOne({
      where: { id: caseId, firmId },
      include: [
        { model: Client, as: "client" },
        { model: Lawyer, as: "lawyers", through: { attributes: [] } },
        {
          model: CaseDocument,
          as: "documents",
          attributes: [
            "id",
            "fileName",
            "fileType",
            "filePath",
            "uploadedById",
            "uploadedByType",
            "createdAt",
          ],
          include: [
            {
              model: Lawyer,
              as: "lawyerUploader",
              attributes: ["id", "name", "email"],
              required: false,
            },
            {
              model: Client,
              as: "clientUploader",
              attributes: ["id", "fullName", "email"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!caseData)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    return res.json({ success: true, case: caseData });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get case details",
      error: err.message,
    });
  }
};

// ==================== UPDATE CASE ====================
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
    const firmId = getActiveFirmId(req);

    if (!caseId)
      return res
        .status(400)
        .json({ success: false, error: "Case ID is required" });

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord)
      return res.status(404).json({
        success: false,
        error: "Case not found or doesn’t belong to this firm",
      });

    if (clientId) {
      const client = await Client.findOne({ where: { id: clientId, firmId } });
      if (!client)
        return res.status(404).json({
          success: false,
          error: "Client not found or doesn’t belong to this firm",
        });
    }

    await caseRecord.update({
      title: title ?? caseRecord.title,
      caseType: caseType ?? caseRecord.caseType,
      description: description ?? caseRecord.description,
      clientId: clientId ?? caseRecord.clientId,
      status: status ?? caseRecord.status,
      openedAt: openedAt ?? caseRecord.openedAt,
      closedAt: closedAt ?? caseRecord.closedAt,
    });

    if (lawyerIds) {
      let lawyerIdArray = [];
      if (Array.isArray(lawyerIds)) {
        lawyerIdArray = lawyerIds
          .map((id) => Number(id))
          .filter((id) => !isNaN(id));
      } else if (typeof lawyerIds === "string") {
        try {
          const parsed = JSON.parse(lawyerIds);
          lawyerIdArray = Array.isArray(parsed)
            ? parsed.map((id) => Number(id)).filter((id) => !isNaN(id))
            : [Number(parsed)].filter((id) => !isNaN(id));
        } catch {
          const num = Number(lawyerIds);
          if (!isNaN(num)) lawyerIdArray = [num];
        }
      }

      if (lawyerIdArray.length > 0) {
        const lawyers = await Lawyer.findAll({
          where: { id: { [Op.in]: lawyerIdArray }, firmId },
        });
        if (lawyers.length === 0)
          return res.status(404).json({
            success: false,
            error: "No valid lawyers found for provided IDs",
          });
        await caseRecord.setLawyers(lawyers);
      }
    }

    if (documentIdsToRemove && Array.isArray(documentIdsToRemove)) {
      await CaseDocument.destroy({
        where: { id: { [Op.in]: documentIdsToRemove }, caseId: caseRecord.id },
      });
    }

    if (req.files && req.files.length > 0) {
      const docs = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        caseId: caseRecord.id,
        uploadedById: req.user.id,
        uploadedByType: req.user.role,
      }));
      await CaseDocument.bulkCreate(docs);
    }

    const updatedCase = await Case.findByPk(caseRecord.id, {
      include: [
        { model: Client, as: "client" },
        { model: Lawyer, as: "lawyers" },
        { model: CaseDocument, as: "documents" },
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

// ==================== DELETE CASE ====================
const deleteCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!caseId)
      return res
        .status(400)
        .json({ success: false, message: "Case Id is required" });
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });

    const caseData = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseData)
      return res
        .status(404)
        .json({ success: false, message: "Case not found for this firm" });

    await Case.destroy({ where: { id: caseId } });

    return res.json({
      success: true,
      message: "Case deleted successfully",
      case: caseData,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ==================== UPDATE CASE STATUS ====================
const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;
    const firmId = getActiveFirmId(req);

    if (!caseId)
      return res
        .status(400)
        .json({ success: false, error: "Case ID is required" });
    if (!status)
      return res
        .status(400)
        .json({ success: false, error: "Status is required" });

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord)
      return res.status(404).json({
        success: false,
        error: "Case not found or doesn’t belong to this firm",
      });

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

// ==================== GET ALL CASES OF CLIENT ====================
const getAllCasesOfClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!clientId)
      return res
        .status(400)
        .json({ success: false, message: "Client Id is required" });
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id missing in token" });

    const client = await Client.findOne({ where: { id: clientId, firmId } });
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found for this firm" });

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

    if (!cases || cases.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No cases found for this client" });

    return res.json({
      success: true,
      client: { id: client.id, name: client.name },
      cases,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ==================== GET ALL CASES OF FIRM ====================
const getAllCasesOfFirm = async (req, res) => {
  try {
    const firmId = req.query.firmId || getActiveFirmId(req);
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });

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
          through: { attributes: [] },
          attributes: ["id", "name", "email", "profileImage"],
        },
      ],
    });

    return res.json({ success: true, count: cases.length, cases });
  } catch (err) {
    console.error("Error fetching cases of firm:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ==================== GET ALL CASES OF LAWYER ====================
const getAllCasesOfLawyer = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const firmId = getActiveFirmId(req);

    let lawyerId = req.params.lawyerId; // may be undefined

    if (role === "Lawyer") {
      // Auto-detect lawyerId for logged-in lawyers
      const lawyerRecord = await Lawyer.findOne({ where: { userId, firmId } });
      if (!lawyerRecord)
        return res.status(404).json({
          success: false,
          message: "Lawyer profile not found for this user",
        });
      lawyerId = lawyerRecord.id;
    }

    // Only require lawyerId if the user is not a lawyer
    if (!lawyerId && role !== "Lawyer") {
      return res
        .status(400)
        .json({ success: false, message: "Lawyer Id is required" });
    }

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
          attributes: [
            "id",
            "fileName",
            "fileType",
            "filePath",
            "uploadedById",
            "uploadedByType",
            "createdAt",
          ],
          include: [
            {
              model: Lawyer,
              as: "lawyerUploader",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: Client,
              as: "clientUploader",
              attributes: ["id", "fullName"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!cases || cases.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No cases found for this lawyer" });

    return res.json({ success: true, count: cases.length, cases });
  } catch (err) {
    console.error("Error fetching lawyer cases:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};


/**
 * Case Document APIs
 */

const getAllCasesDocumentsByFirm = async (req, res) => {
  try {
    const firmId = getActiveFirmId(req);
    if (!firmId) {
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });
    }

    const documents = await CaseDocument.findAll({
      attributes: [
        "id",
        "fileName",
        "fileType",
        "filePath",
        "uploadedById",
        "uploadedByType",
        "createdAt",
      ],
      include: [
        {
          model: Case,
          as: "case",
          attributes: ["id", "title", "caseNumber"],
          where: { firmId },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    console.error("Error fetching case documents of firm:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const addDocumentsByCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!caseId)
      return res
        .status(400)
        .json({ success: false, message: "Case Id is required" });
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord)
      return res
        .status(404)
        .json({ success: false, message: "Case not found for this firm" });

    // Role-based access
    if (req.user.role === "Lawyer") {
      const lawyer = await Lawyer.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (!lawyer)
        return res
          .status(403)
          .json({ success: false, message: "Lawyer profile not found" });
      const assignedCount = await caseRecord.countLawyers({
        where: { id: lawyer.id },
      });
      if (assignedCount === 0)
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this case",
        });
    } else if (req.user.role === "Client") {
      const client = await Client.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (!client)
        return res
          .status(403)
          .json({ success: false, message: "Client profile not found" });
      if (caseRecord.clientId !== client.id)
        return res.status(403).json({
          success: false,
          message: "You are not the client of this case",
        });
    } else if (req.user.role !== "Firm Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No documents uploaded" });
    }

    const docs = req.files.map((file) => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      caseId: caseRecord.id,
      uploadedById: req.user.id,
      uploadedByType: req.user.role,
    }));

    const created = await CaseDocument.bulkCreate(docs);

    return res.status(201).json({
      success: true,
      message: "Documents uploaded",
      documents: created,
    });
  } catch (err) {
    console.error("Add Documents Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const getAllDocumentsByCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!caseId)
      return res
        .status(400)
        .json({ success: false, message: "Case Id is required" });
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord)
      return res
        .status(404)
        .json({ success: false, message: "Case not found for this firm" });

    // Role-based visibility checks
    if (req.user.role === "Lawyer") {
      const lawyer = await Lawyer.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (!lawyer)
        return res
          .status(403)
          .json({ success: false, message: "Lawyer profile not found" });
      const assignedCount = await caseRecord.countLawyers({
        where: { id: lawyer.id },
      });
      if (assignedCount === 0)
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this case",
        });
    } else if (req.user.role === "Client") {
      const client = await Client.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (!client)
        return res
          .status(403)
          .json({ success: false, message: "Client profile not found" });
      if (caseRecord.clientId !== client.id)
        return res.status(403).json({
          success: false,
          message: "You are not the client of this case",
        });
    } else if (req.user.role !== "Firm Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const documents = await CaseDocument.findAll({
      where: { caseId: caseRecord.id },
      attributes: [
        "id",
        "fileName",
        "fileType",
        "filePath",
        "uploadedById",
        "uploadedByType",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    console.error("List Documents Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const getOneDocumentOfCase = async (req, res) => {
  try {
    const { caseId, docId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!caseId || !docId)
      return res
        .status(400)
        .json({ success: false, message: "Case Id and Document Id are required" });
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord)
      return res
        .status(404)
        .json({ success: false, message: "Case not found for this firm" });

    // Role-based visibility checks
    if (req.user.role === "Lawyer") {
      const lawyer = await Lawyer.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (!lawyer)
        return res
          .status(403)
          .json({ success: false, message: "Lawyer profile not found" });
      const assignedCount = await caseRecord.countLawyers({
        where: { id: lawyer.id },
      });
      if (assignedCount === 0)
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this case",
        });
    } else if (req.user.role === "Client") {
      const client = await Client.findOne({
        where: { userId: req.user.id, firmId },
      });
      if (!client)
        return res
          .status(403)
          .json({ success: false, message: "Client profile not found" });
      if (caseRecord.clientId !== client.id)
        return res.status(403).json({
          success: false,
          message: "You are not the client of this case",
        });
    } else if (req.user.role !== "Firm Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const document = await CaseDocument.findOne({
      where: { id: docId, caseId: caseRecord.id },
      attributes: [
        "id",
        "fileName",
        "fileType",
        "filePath",
        "uploadedById",
        "uploadedByType",
        "createdAt",
      ],
    });

    if (!document)
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });

    return res.json({ success: true, document });
  } catch (err) {
    console.error("Get Document Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const deleteDocumentOfCase = async (req, res) => {
  try {
    const { caseId, docId } = req.params;
    const firmId = getActiveFirmId(req);

    if (!caseId || !docId)
      return res
        .status(400)
        .json({ success: false, message: "Case Id and Document Id are required" });
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm Id is required" });

    const caseRecord = await Case.findOne({ where: { id: caseId, firmId } });
    if (!caseRecord)
      return res
        .status(404)
        .json({ success: false, message: "Case not found for this firm" });

    const document = await CaseDocument.findOne({
      where: { id: docId, caseId: caseRecord.id },
    });

    if (!document)
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });

    // Try removing file from disk
    try {
      const fs = require("fs");
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (fileErr) {
      // proceed even if file removal fails
      console.warn("File unlink failed:", fileErr.message);
    }

    await document.destroy();

    return res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error("Delete Document Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
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
  getAllCasesDocumentsByFirm,
  addDocumentsByCase,
  getAllDocumentsByCase,
  getOneDocumentOfCase,
  deleteDocumentOfCase,
};
