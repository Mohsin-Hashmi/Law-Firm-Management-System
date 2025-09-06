"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Lawyer extends Model {
    static associate(models) {
      // One Lawyer belongs to one Firm
      Lawyer.belongsTo(models.Firm, {
        foreignKey: "firmId",
        as: "firm",
        onDelete: "CASCADE",
      });
      Lawyer.belongsToMany(models.Case, {
        through: models.CaseLawyer,
        as: "cases",
        foreignKey: "lawyerId",
      });
      Lawyer.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }

  Lawyer.init(
    {
      firmId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Firms", // Must match table name
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // must match the User table name
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specialization: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        defaultValue: "Active",
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Lawyer",
      tableName: "lawyers",
    }
  );

  return Lawyer;
};
