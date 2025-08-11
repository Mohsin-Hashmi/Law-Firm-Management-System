'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lawyer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       // One Lawyer belongs to one Firm
      Lawyer.belongsTo(models.Firm, { 
        foreignKey: 'firmId', 
        as: 'firm', 
        onDelete: 'CASCADE' 
      });
    }
  }
  Lawyer.init({
     firmId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specialization: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Active'
    }
  }, {
    sequelize,
    modelName: 'Lawyer',
    tableName: 'lawyers'
  });
  return Lawyer;
};