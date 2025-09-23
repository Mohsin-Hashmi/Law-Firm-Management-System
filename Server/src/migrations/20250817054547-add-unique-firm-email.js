"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Users", {
      fields: ["email"], // remove firmId
      type: "unique",
      name: "unique_email", // update name accordingly
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint("Users", "unique_email");
    } catch (error) {
      console.warn("⚠️ Skipping removal of unique_email:", error.message);
    }
  },
};
