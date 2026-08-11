'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasUserFirms = tables.some((table) => {
      const tableName = typeof table === "object" ? table.tableName : table;
      return tableName === "userfirms";
    });

    if (hasUserFirms) return;

    await queryInterface.createTable('userfirms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },   // Capital U
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      firmId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Firms', key: 'id' },   
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'roles', key: 'id' },   
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasUserFirms = tables.some((table) => {
      const tableName = typeof table === "object" ? table.tableName : table;
      return tableName === "userfirms";
    });

    if (hasUserFirms) {
      await queryInterface.dropTable('userfirms');
    }
  },
};
