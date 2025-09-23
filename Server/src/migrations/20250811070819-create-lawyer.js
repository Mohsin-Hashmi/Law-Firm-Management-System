"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Lawyers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firmId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Firms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      specialization: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
        defaultValue: "Active",
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
    // ✅ Explicitly remove foreign key first
    try {
      await queryInterface.removeConstraint("Lawyers", "Lawyers_ibfk_1");
    } catch (error) {
      console.warn("⚠️ Skipping removal of Lawyers_ibfk_1:", error.message);
    }

    await queryInterface.dropTable("Lawyers");
  },
};
