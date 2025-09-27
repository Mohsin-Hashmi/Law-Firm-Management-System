// src/models/caseDocument.js
module.exports = (sequelize, DataTypes) => {
  const CaseDocument = sequelize.define("CaseDocument", {
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING },
    filePath: { type: DataTypes.STRING, allowNull: false },

    uploadedById: { type: DataTypes.INTEGER, allowNull: true }, 
    uploadedByType: { 
      type: DataTypes.ENUM("Lawyer", "Client", "Firm Admin"), 
      allowNull: true 
    },
  });

  CaseDocument.associate = (models) => {
    CaseDocument.belongsTo(models.Case, { foreignKey: "caseId", as: "case" });

    // Polymorphic associations
    CaseDocument.belongsTo(models.Lawyer, {
      foreignKey: "uploadedById",
      constraints: false,
      as: "lawyerUploader",
    });

    CaseDocument.belongsTo(models.Client, {
      foreignKey: "uploadedById",
      constraints: false,
      as: "clientUploader",
    });

    CaseDocument.belongsTo(models.Firm, {
      foreignKey: "uploadedById",
      constraints: false,
      as: "firmUploader",
    });
  };

  return CaseDocument;
};
