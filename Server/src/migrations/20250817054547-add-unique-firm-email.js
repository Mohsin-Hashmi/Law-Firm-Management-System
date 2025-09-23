"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Users", {
      fields: ["firmId", "email"],
      type: "unique",
      name: "unique_firm_email",
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint("Users", "unique_firm_email");
    } catch (error) {
      console.warn("⚠️ Skipping removal of unique_firm_email:", error.message);
    }
  },
};
