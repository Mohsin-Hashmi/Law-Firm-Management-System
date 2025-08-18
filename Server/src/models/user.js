'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Firm, { foreignKey: 'firmId', as: 'firm' });
    }
  }

  User.init({
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false  // ensure every user has an email
    },
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('Super Admin','Firm Admin','Lawyer','Client'),
      defaultValue: 'Lawyer'
    },
    firmId: {
      type: DataTypes.INTEGER,
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'User',
    indexes: [
      {
        unique: true,
        fields: ['firmId', 'email'] 
      }
    ]
  });

  return User;
};
