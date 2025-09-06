"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "mustChangePassword", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // existing rows get false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "mustChangePassword");
  },
};
