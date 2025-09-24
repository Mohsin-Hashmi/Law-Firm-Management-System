"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old umbrella permissions
    await queryInterface.bulkDelete("permissions", {
      name: ["manage_lawyers", "manage_clients"],
    });

    // Insert granular lawyer & client permissions
    await queryInterface.bulkInsert("permissions", [
      // Lawyer CRUD
      { name: "create_lawyer", createdAt: new Date(), updatedAt: new Date() },
      { name: "read_lawyer", createdAt: new Date(), updatedAt: new Date() },
      { name: "update_lawyer", createdAt: new Date(), updatedAt: new Date() },
      { name: "delete_lawyer", createdAt: new Date(), updatedAt: new Date() },

      // Client CRUD
      { name: "create_client", createdAt: new Date(), updatedAt: new Date() },
      { name: "read_client", createdAt: new Date(), updatedAt: new Date() },
      { name: "update_client", createdAt: new Date(), updatedAt: new Date() },
      { name: "delete_client", createdAt: new Date(), updatedAt: new Date() },

      // Case CRUD + operations
      { name: "create_case", createdAt: new Date(), updatedAt: new Date() },
      { name: "read_case", createdAt: new Date(), updatedAt: new Date() },
      { name: "update_case", createdAt: new Date(), updatedAt: new Date() },
      { name: "delete_case", createdAt: new Date(), updatedAt: new Date() },
      { name: "view_case_status", createdAt: new Date(), updatedAt: new Date() },
      { name: "update_case_status", createdAt: new Date(), updatedAt: new Date() },
      { name: "assign_lawyer_to_case", createdAt: new Date(), updatedAt: new Date() },
      { name: "view_case_documents", createdAt: new Date(), updatedAt: new Date() },
      { name: "upload_case_document", createdAt: new Date(), updatedAt: new Date() },
      { name: "delete_case_document", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove granular lawyer, client, and case permissions
    await queryInterface.bulkDelete("permissions", {
      name: [
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
      ],
    });

    // Restore umbrella permissions
    await queryInterface.bulkInsert("permissions", [
      { name: "manage_lawyers", createdAt: new Date(), updatedAt: new Date() },
      { name: "manage_clients", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
};
