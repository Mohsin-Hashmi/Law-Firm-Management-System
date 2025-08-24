module.exports = (sequelize, DataTypes) => {
  const Case = sequelize.define("Case", {
    title: { type: DataTypes.STRING, allowNull: false },
    caseNumber: { type: DataTypes.STRING, allowNull: false },
    caseType: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("Open", "Closed", "On Hold", "Appeal"),
      defaultValue: "Open",
    },
    openedAt: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    closedAt: { type: DataTypes.DATEONLY, allowNull: true },
    description: DataTypes.TEXT,
  });

  Case.associate = (models) => {
    Case.belongsTo(models.Firm, { foreignKey: "firmId", as: "firm" });
    Case.belongsTo(models.Client, { foreignKey: "clientId", as: "client" });
    Case.belongsToMany(models.Lawyer, {
      through: "CaseLawyers",
      as: "lawyers",
      foreignKey: "caseId",
    });
  };

  return Case;
};
