"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add a temporary column with ENUM
    await queryInterface.addColumn("Firms", "status_temp", {
      type: Sequelize.ENUM("Active", "Suspended", "Cancelled", "Unknown"),
      allowNull: false,
      defaultValue: "Active",
    });

    // 2. Map old integer values to new ENUM values
    await queryInterface.sequelize.query(`
      UPDATE Firms 
      SET status_temp = CASE 
        WHEN status = 1 THEN 'Active'
        WHEN status = 2 THEN 'Suspended'
        WHEN status = 3 THEN 'Cancelled'
        WHEN status = 4 THEN 'Unknown'
        ELSE 'Unknown'
      END;
    `);

    // 3. Remove the old column
    await queryInterface.removeColumn("Firms", "status");

    // 4. Rename new column to "status"
    await queryInterface.renameColumn("Firms", "status_temp", "status");
  },

  async down(queryInterface, Sequelize) {
    // Rollback: go back to INTEGER
    await queryInterface.addColumn("Firms", "status_temp", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    // Convert back to integers
    await queryInterface.sequelize.query(`
      UPDATE Firms 
      SET status_temp = CASE 
        WHEN status = 'Active' THEN 1
        WHEN status = 'Suspended' THEN 2
        WHEN status = 'Cancelled' THEN 3
        WHEN status = 'Unknown' THEN 4
        ELSE 1
      END;
    `);

    await queryInterface.removeColumn("Firms", "status");
    await queryInterface.renameColumn("Firms", "status_temp", "status");
  },
};
