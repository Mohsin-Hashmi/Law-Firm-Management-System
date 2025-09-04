"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Fetch all permissions
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, name FROM permissions;`
    );

    const rolePermissions = [];

    // Role to permissions mapping
    const rolePermissionMap = {
      1: permissions.map(p => p.name), // Super Admin = all permissions
      2: ["create_firm", "update_firm", "delete_firm", "manage_lawyers", "manage_clients", "view_stats"], // Firm Admin
      3: ["manage_clients", "view_stats"], // Lawyer
      4: [], // Client
    };

    for (const [roleId, permNames] of Object.entries(rolePermissionMap)) {
      for (const perm of permissions.filter(p => permNames.includes(p.name))) {
        rolePermissions.push({
          roleId: parseInt(roleId),
          permissionId: perm.id,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert("role_permissions", rolePermissions, {
      ignoreDuplicates: true, // ensures new ones get added only
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
