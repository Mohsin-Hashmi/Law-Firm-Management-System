'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove foreign key constraint if exists
    await queryInterface.removeConstraint('users', 'unique_firm_email'); // name may differ
    await queryInterface.removeColumn('users', 'firmId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'firmId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'firms', // must be table name, not model name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
