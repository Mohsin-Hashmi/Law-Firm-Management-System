"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add uploadedById column
    await queryInterface.addColumn("CaseDocuments", "uploadedById", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Add uploadedByType column
    await queryInterface.addColumn("CaseDocuments", "uploadedByType", {
      type: Sequelize.ENUM("Lawyer", "Client", "Firm Admin"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("CaseDocuments", "uploadedById");
    await queryInterface.removeColumn("CaseDocuments", "uploadedByType");

    // Drop ENUM type to avoid errors on re-run
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_CaseDocuments_uploadedByType";'
    );
  },
};
