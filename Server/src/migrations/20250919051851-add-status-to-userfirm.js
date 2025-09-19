'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('userfirms', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('userfirms', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_userfirms_status";'); // cleanup for Postgres
  }
};
