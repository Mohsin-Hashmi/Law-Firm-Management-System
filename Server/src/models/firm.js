'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Firm extends Model {
    static associate(models) {
      // define association here
    }
  }

  Firm.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subscription_plan: {
      type: DataTypes.ENUM("Free", "Basic", "Premium"),
      allowNull: false
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_cases: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("Active", "Suspended", "Cancelled"),
      allowNull: false
    },
    billing_info: {
      type: DataTypes.JSON,
      allowNull: true
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Firm',
    tableName: 'Firms' // optional but keeps naming consistent
  });

  return Firm;
};
