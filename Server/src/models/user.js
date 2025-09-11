"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });

      // A User can be connected to many Firms through AdminFirm
      User.hasMany(models.AdminFirm, {
        foreignKey: "adminId",
        as: "adminFirms",
      });

      // A User can be connected to many Lawyers
      User.hasMany(models.Lawyer, { foreignKey: "userId", as: "lawyers" });
      User.hasMany(models.Client, {
        foreignKey: "userId",
        as: "client",
      });

      // New associations for UserFirm
      User.hasMany(models.UserFirm, { foreignKey: "userId", as: "userFirms" });
      User.belongsToMany(models.Firm, {
        through: models.UserFirm,
        foreignKey: "userId",
        otherKey: "firmId",
        as: "firms",
      });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: DataTypes.STRING,
      mustChangePassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );

  return User;
};
