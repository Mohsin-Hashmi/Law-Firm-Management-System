'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
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
      tableName: 'permissions', // match migration
      timestamps: true,         // required for createdAt, updatedAt
    }
  );

  return Permission;
};
