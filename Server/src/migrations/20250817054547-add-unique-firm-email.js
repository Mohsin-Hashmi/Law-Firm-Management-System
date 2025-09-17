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
    // Remove the unique constraint safely
    await queryInterface.removeConstraint("Users", "unique_firm_email");
  },
};
