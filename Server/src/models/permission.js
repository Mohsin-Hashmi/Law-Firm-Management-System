'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Many-to-many: Permission <-> Role
      Permission.belongsToMany(models.Role, {
        through: 'role_permissions',
        foreignKey: 'permissionId',
        as: 'roles',
      });
    }
  }

  Permission.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Permission',
    }
  );

  return Permission;
};
