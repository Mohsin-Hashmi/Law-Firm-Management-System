// seeders/20230903-seed-permissions.js
"use strict";
const permissions = require("../constants/permissions");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const p of Object.values(permissions)) {
        // ✅ Use MySQL-friendly backticks instead of double quotes
        const [result] = await queryInterface.sequelize.query(
          `SELECT id FROM \`Permissions\` WHERE name = :name LIMIT 1`,
          {
            replacements: { name: p },
            transaction,
          }
        );

        if (result.length === 0) {
          // Insert only if not exists
          await queryInterface.bulkInsert(
            "Permissions",
            [
              {
                name: p,
                createdAt: now,
                updatedAt: now,
              },
            ],
            { transaction }
          );
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    // ✅ Safer: delete only seeded permissions
    await queryInterface.bulkDelete(
      "Permissions",
      {
        name: Object.values(require("../constants/permissions")),
      },
      {}
    );
  },
};
