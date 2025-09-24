// seeders/20230903-seed-permissions.js
"use strict";
const permissions = require("../constants/permissions");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const p of Object.values(permissions)) {
        const [result] = await queryInterface.sequelize.query(
          `SELECT id FROM \`permissions\` WHERE name = :name LIMIT 1`, // lowercase
          {
            replacements: { name: p },
            transaction,
          }
        );

        if (result.length === 0) {
          await queryInterface.bulkInsert(
            "permissions", // lowercase
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
    await queryInterface.bulkDelete(
      "permissions", // lowercase
      {
        name: Object.values(require("../constants/permissions")),
      },
      {}
    );
  },
};
