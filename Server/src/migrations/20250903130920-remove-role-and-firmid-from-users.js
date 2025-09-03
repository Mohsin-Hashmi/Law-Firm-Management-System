'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'role');   // remove old enum role column
    await queryInterface.removeColumn('users', 'firmId'); // remove old firmId column
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('Super Admin', 'Firm Admin', 'Lawyer', 'Client'),
      defaultValue: 'Lawyer',
    });
    await queryInterface.addColumn('users', 'firmId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'firms',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
