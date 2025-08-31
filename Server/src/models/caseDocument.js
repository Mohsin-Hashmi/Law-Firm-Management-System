// src/models/caseDocument.js
module.exports = (sequelize, DataTypes) => {
  const CaseDocument = sequelize.define("CaseDocument", {
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING },
    filePath: { type: DataTypes.STRING, allowNull: false },
    uploadedBy: { type: DataTypes.INTEGER, allowNull: false }, // 👈 added
  });

  CaseDocument.associate = (models) => {
    CaseDocument.belongsTo(models.Case, { foreignKey: "caseId", as: "case" });
    CaseDocument.belongsTo(models.Lawyer, { foreignKey: "uploadedBy", as: "uploader" }); // 👈 optional relation
  };

  return CaseDocument;
};
