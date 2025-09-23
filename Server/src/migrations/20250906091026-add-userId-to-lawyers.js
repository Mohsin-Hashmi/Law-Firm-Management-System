'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Lawyers", "userId", {  // Capital L
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",  // Capital U, matches your table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Lawyers", "userId");  // Capital L
  },
};
