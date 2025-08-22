"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AdminFirm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AdminFirm.belongsTo(models.User, { foreignKey: "adminId", as: "admin" });
      AdminFirm.belongsTo(models.Firm, { foreignKey: "firmId", as: "firm" });
    }
  }
  AdminFirm.init(
    {
      adminId: DataTypes.INTEGER,
      firmId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "AdminFirm",
      tableName: "AdminFirms",
    }
  );
  return AdminFirm;
};
