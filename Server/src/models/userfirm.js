'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFirm extends Model {
    static associate(models) {
      UserFirm.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      UserFirm.belongsTo(models.Firm, { foreignKey: 'firmId', as: 'firm' });
      UserFirm.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    }
  }
  
  UserFirm.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      firmId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserFirm',
      tableName: 'userfirms',
      timestamps: true,
    }
  );

  return UserFirm;
};
