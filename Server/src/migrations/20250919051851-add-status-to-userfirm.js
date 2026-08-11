'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('userfirms');
    if (table.status) return;

    await queryInterface.addColumn('userfirms', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // ✅ Check if column exists before removing
    const table = await queryInterface.describeTable('userfirms');
    if (table.status) {
      await queryInterface.removeColumn('userfirms', 'status');
    }

    
  },
};
