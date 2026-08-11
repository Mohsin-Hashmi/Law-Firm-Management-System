"use strict";

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("CaseDocuments");
    if (table.uploadedBy) {
      await queryInterface.removeColumn("CaseDocuments", "uploadedBy");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("CaseDocuments");
    if (!table.uploadedBy) {
      await queryInterface.addColumn("CaseDocuments", "uploadedBy", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },
};
