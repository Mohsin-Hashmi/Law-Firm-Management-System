'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Fetch all roles and permissions from DB
    const [roles] = await queryInterface.sequelize.query(`SELECT id, name FROM roles;`);
    const [permissions] = await queryInterface.sequelize.query(`SELECT id, name FROM permissions;`);

    if (!roles.length || !permissions.length) {
      throw new Error('Roles or Permissions table is empty. Seed them first!');
    }

    // Map role names to IDs
    const roleMap = {};
    roles.forEach(r => { roleMap[r.name] = r.id; });

    // Define role → permission names mapping
    const rolePermissionMap = {
      'Super Admin': permissions.map(p => p.name),
      'Firm Admin': [
        "create_firm","view-all-firms","update_firm","delete_firm",
        "create_lawyer","read_lawyer","update_lawyer","delete_lawyer",
        "create_client","read_client","update_client","delete_client",
        "create_case","read_case","update_case","delete_case",
        "view_case_status","update_case_status","assign_lawyer_to_case",
        "view_case_documents","upload_case_document","delete_case_document",
        "view_stats","assign_role","create_role","view_role"
      ],
      'Lawyer': [
        "read_client","create_case","create_client","read_case",
        "view_case_status","view_case_documents","upload_case_document","view_stats"
      ],
      'Client': [
        "read_case","view_case_status","view_case_documents","upload_case_document","view_stats"
      ]
    };

    // Prepare inserts
    const rolePermissions = [];
    for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
      const roleId = roleMap[roleName];
      if (!roleId) continue;

      permissions.filter(p => permNames.includes(p.name))
        .forEach(p => {
          rolePermissions.push({
            roleId,
            permissionId: p.id,
            createdAt: now,
            updatedAt: now
          });
        });
    }

    await queryInterface.bulkInsert('role_permissions', rolePermissions, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  },
};
