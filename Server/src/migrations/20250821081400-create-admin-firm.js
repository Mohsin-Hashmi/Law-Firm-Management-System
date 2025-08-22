'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminFirms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // assuming User model is called Users in DB
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      firmId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Firms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Composite unique constraint so one admin cannot add the same firm twice
    await queryInterface.addConstraint('AdminFirms', {
      fields: ['adminId', 'firmId'],
      type: 'unique',
      name: 'unique_admin_firm'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('AdminFirms', 'unique_admin_firm');
    await queryInterface.dropTable('AdminFirms');
  }
};
