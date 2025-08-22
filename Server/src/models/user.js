'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A User can be connected to many Firms (through AdminFirm)
      User.hasMany(models.AdminFirm, { foreignKey: "adminId", as: "adminFirms" });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false, // ensure every user has an email
      },
      password: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM('Super Admin', 'Firm Admin', 'Lawyer', 'Client'),
        defaultValue: 'Lawyer',
      },
    },
    {
      sequelize,
      modelName: 'User',
      indexes: [
        {
          unique: true,
          fields: ['email'], // enforce unique email across system
        },
      ],
    }
  );

  return User;
};
