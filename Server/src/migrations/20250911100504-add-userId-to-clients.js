"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Clients", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true, // clients must be linked to a user
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Clients", "userId");
  },
};
