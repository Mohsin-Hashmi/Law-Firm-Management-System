'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Lawyers', 'profileImage', { // <-- Capital L
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Lawyers', 'profileImage'); // <-- Capital L
  }
};
