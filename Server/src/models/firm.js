// Firm.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Firm extends Model {
    static associate(models) {
      // A Firm can have many Lawyers
      Firm.hasMany(models.Lawyer, {
        foreignKey: "firmId",
        as: "lawyers",
        onDelete: "CASCADE",
      });

      // Many-to-Many: Firms <-> Users (Admins)
      Firm.hasMany(models.AdminFirm, { foreignKey: "firmId", as: "adminFirms" });

      // ✅ associations for UserFirm
      Firm.hasMany(models.UserFirm, { foreignKey: "firmId", as: "userFirms" });
      Firm.belongsToMany(models.User, {
        through: models.UserFirm,
        foreignKey: "firmId",
        otherKey: "userId",
        as: "users",
      });
    }
  }

  Firm.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      subscription_plan: {
        type: DataTypes.ENUM("Free", "Basic", "Premium"),
        allowNull: false,
      },
      max_users: { type: DataTypes.INTEGER, allowNull: false },
      max_cases: { type: DataTypes.INTEGER, allowNull: false },
      subdomain: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: "Firm",
      tableName: "Firms",
    }
  );

  return Firm;
};
