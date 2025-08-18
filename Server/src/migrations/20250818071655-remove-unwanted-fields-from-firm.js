"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Firms", "status");
    await queryInterface.removeColumn("Firms", "billing_info");
    await queryInterface.removeColumn("Firms", "trial_ends_at");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Firms", "status", {
      type: Sequelize.ENUM("Active", "Suspended", "Cancelled"),
      allowNull: false,
    });
    await queryInterface.addColumn("Firms", "billing_info", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn("Firms", "trial_ends_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
