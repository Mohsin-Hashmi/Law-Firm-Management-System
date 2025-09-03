module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "roleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles", // must match table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("users", "roleId");
  },
};
