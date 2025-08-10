"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Firms", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
      },
      subscription_plan: {
        type: Sequelize.ENUM("Free", "Basic", "Premium"),
        allowNull: false,
        defaultValue: "Free",
      },
      max_users: {
        type: Sequelize.INTEGER,
      },
      max_cases: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM("Active", "Suspended", "Cancelled"),
        allowNull: false,
        defaultValue: "Active",
      },
      billing_info: {
        type: Sequelize.JSON,
      },
      trial_ends_at: {
        type: Sequelize.DATE,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Firms");
  },
};
