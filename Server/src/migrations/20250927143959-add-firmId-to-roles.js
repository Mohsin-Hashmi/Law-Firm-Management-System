"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("roles", "firmId", {
      type: Sequelize.INTEGER,
      allowNull: true, // make it true if you want system/global roles to exist
      references: {
        model: "Firms", // name of your Firms table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("roles", "firmId");
  },
};
