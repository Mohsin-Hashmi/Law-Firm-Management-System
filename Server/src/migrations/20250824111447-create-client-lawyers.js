"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("ClientLawyers", {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      clientId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Clients", key: "id" },
        onDelete: "CASCADE",
      },
      lawyerId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Lawyers", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: { type: S.DATE, defaultValue: S.NOW },
      updatedAt: { type: S.DATE, defaultValue: S.NOW },
    });
    await q.addConstraint("ClientLawyers", {
      fields: ["clientId", "lawyerId"],
      type: "unique",
      name: "uq_client_lawyer",
    });
  },
  async down(q) {
    await q.dropTable("ClientLawyers");
  },
};
