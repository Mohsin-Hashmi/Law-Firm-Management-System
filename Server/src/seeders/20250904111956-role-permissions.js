"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Fetch all permissions
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, name FROM \`Permissions\`;`
    );
    if (!permissions || permissions.length === 0) {
      throw new Error(
        "No permissions found! Make sure permissions are seeded first."
      );
    }
    const rolePermissions = [];

    // Map role IDs to permissions
    const rolePermissionMap = {
      1: permissions.map((p) => p.name), // Super Admin → all permissions
      2: [
        "create_firm",
        "update_firm",
        "delete_firm",
        "create_lawyer",
        "read_lawyer",
        "update_lawyer",
        "delete_lawyer",
        "create_client",
        "read_client",
        "update_client",
        "delete_client",
        "create_case",
        "read_case",
        "update_case",
        "delete_case",
        "view_case_status",
        "update_case_status",
        "assign_lawyer_to_case",
        "view_case_documents",
        "upload_case_document",
        "delete_case_document",
        "view_stats",
        "assign_role",
      ], // Firm Admin → granular
      3: [
        "read_client",
        "update_client",
        "read_case",
        "update_case",
        "view_case_status",
        "assign_lawyer_to_case",
        "view_case_documents",
        "upload_case_document",
        "view_stats",
      ], // Lawyer
      4: [
        "read_case",
        "view_case_status",
        "view_case_documents",
        "upload_case_document",
      ], // Client
    };

    // Build role_permissions insert array
    for (const [roleId, permNames] of Object.entries(rolePermissionMap)) {
      for (const perm of permissions.filter((p) =>
        permNames.includes(p.name)
      )) {
        rolePermissions.push({
          roleId: parseInt(roleId),
          permissionId: perm.id,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert("role_permissions", rolePermissions, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
