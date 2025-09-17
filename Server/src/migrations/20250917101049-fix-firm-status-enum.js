"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove the old integer status column if it exists
    await queryInterface.removeColumn("Firms", "status");

    // 2. Re-add it as ENUM
    await queryInterface.addColumn("Firms", "status", {
      type: Sequelize.ENUM("Active", "Suspended", "Cancelled"),
      allowNull: false,
      defaultValue: "Active",
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove ENUM and restore integer
    await queryInterface.removeColumn("Firms", "status");
    await queryInterface.addColumn("Firms", "status", {
      type: Sequelize.INTEGER,
    });
  },
};
