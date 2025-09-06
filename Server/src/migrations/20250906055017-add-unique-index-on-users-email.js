"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // make sure column is non-nullable
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // add unique index
    await queryInterface.addIndex("Users", ["email"], {
      unique: true,
      name: "users_email_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Users", "users_email_unique");
  },
};
