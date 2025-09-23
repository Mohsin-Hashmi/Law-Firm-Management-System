'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "roleId", {  // Match table name exactly
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles",   // lowercase, match your DB table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "roleId");  // Match table name
  },
};
