"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Users", {
      fields: ["firmId", "email"],
      type: "unique",
      name: "unique_firm_email", // custom name for the constraint
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Users", "unique_firm_email");
  },
};
