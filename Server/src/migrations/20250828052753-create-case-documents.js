"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CaseDocuments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      caseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Cases",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      fileName: { type: Sequelize.STRING, allowNull: false },
      filePath: { type: Sequelize.STRING, allowNull: false },
      fileType: { type: Sequelize.STRING, allowNull: false },
      uploadedBy: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CaseDocuments");
  },
};
