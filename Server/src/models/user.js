"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
      // A User can be connected to many Firms (through AdminFirm)
      User.hasMany(models.AdminFirm, {
        foreignKey: "adminId",
        as: "adminFirms",
      });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false, // ensure every user has an email
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
        allowNull: false, // ensure every user has a role
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
          fields: ["email"], // enforce unique email across system
        },
      ],
    }
  );

  return User;
};
