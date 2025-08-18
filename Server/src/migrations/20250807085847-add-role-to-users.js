'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('Super Admin', 'Firm Admin', 'Lawyer', 'Client'),
      allowNull: false,
      defaultValue: 'Lawyer',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('Super Admin', 'Firm Admin', 'Lawyer', 'Assistant'), // old ENUM
      allowNull: false,
      defaultValue: 'Lawyer',
    });
  }
};
