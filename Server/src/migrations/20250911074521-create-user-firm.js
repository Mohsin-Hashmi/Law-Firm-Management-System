'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Legacy duplicate migration. The application uses lowercase `userfirms`,
    // created by 20250911070000-create-role.js.
  },
  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasUserFirms = tables.some((table) => {
      const tableName = typeof table === "object" ? table.tableName : table;
      return tableName === "UserFirms";
    });

    if (hasUserFirms) {
      await queryInterface.dropTable('UserFirms');
    }
  }
};
