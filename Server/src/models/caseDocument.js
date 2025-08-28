// src/models/caseDocument.js
module.exports = (sequelize, DataTypes) => {
  const CaseDocument = sequelize.define("CaseDocument", {
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING },
    filePath: { type: DataTypes.STRING, allowNull: false },
  });

  CaseDocument.associate = (models) => {
    CaseDocument.belongsTo(models.Case, { foreignKey: "caseId", as: "case" });
  };

  return CaseDocument;
};
