"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ClientLawyer extends Model {
    static associate(models) {
      // ClientLawyer belongs to a Client
      ClientLawyer.belongsTo(models.Client, {
        foreignKey: "clientId",
        as: "client",
      });

      // ClientLawyer belongs to a Lawyer
      ClientLawyer.belongsTo(models.Lawyer, {
        foreignKey: "lawyerId",
        as: "lawyer",
      });

      
    }
  }

  ClientLawyer.init(
    {
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lawyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ClientLawyer",
      tableName: "ClientLawyers", // ✅ use your actual table
    }
  );

  return ClientLawyer;
};
