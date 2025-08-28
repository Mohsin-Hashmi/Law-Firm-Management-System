"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CaseLawyer extends Model {
    static associate(models) {
      // A CaseLawyer belongs to a Case
      CaseLawyer.belongsTo(models.Case, {
        foreignKey: "caseId",
        as: "case",
      });

      // A CaseLawyer belongs to a Lawyer
      CaseLawyer.belongsTo(models.Lawyer, {
        foreignKey: "lawyerId",
        as: "lawyer",
      });
    }
  }

  CaseLawyer.init(
    {
      caseId: {
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
      modelName: "CaseLawyer",
      tableName: "CaseLawyers",
    }
  );

  return CaseLawyer;
};
