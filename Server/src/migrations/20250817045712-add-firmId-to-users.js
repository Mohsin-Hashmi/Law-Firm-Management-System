"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "firmId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Firms", // the name of your Firms table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "firmId");
  },
};
