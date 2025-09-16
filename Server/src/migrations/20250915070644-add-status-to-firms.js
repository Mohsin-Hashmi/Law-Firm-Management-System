"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Firms", "status", {
      type: Sequelize.ENUM("active", "suspended", "terminated"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Firms", "status");

    // Cleanup ENUM type (important for Postgres)
    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Firms_status";'
      );
    }
  },
};
