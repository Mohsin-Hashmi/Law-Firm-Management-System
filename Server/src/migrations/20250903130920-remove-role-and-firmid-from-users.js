'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Users', 'role');   // Capital U
    } catch (err) {
      console.warn("⚠️ Column 'role' not found, skipping.");
    }

    try {
      await queryInterface.removeColumn('Users', 'firmId'); // Capital U
    } catch (err) {
      console.warn("⚠️ Column 'firmId' not found, skipping.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('Super Admin', 'Firm Admin', 'Lawyer', 'Client'),
      defaultValue: 'Lawyer',
    });

    await queryInterface.addColumn('Users', 'firmId', {
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
