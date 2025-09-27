"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, { foreignKey: "roleId", as: "users" });
      Role.belongsToMany(models.Permission, {
        through: "role_permissions",
        foreignKey: "roleId",
        as: "permissions",
      });
      Role.belongsTo(models.Firm, { foreignKey: "firmId", as: "firm" });
    }
  }

  Role.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles", // <- force lowercase table name
    }
  );

  return Role;
};
