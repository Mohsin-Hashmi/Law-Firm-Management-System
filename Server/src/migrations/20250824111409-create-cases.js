"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Cases", {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      firmId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Firms", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      clientId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Clients", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      title: { type: S.STRING, allowNull: false },
      caseNumber: { type: S.STRING, allowNull: false }, // human-friendly
      caseType: { type: S.STRING },                     // e.g., "Civil", "Criminal"
      status: {
        type: S.ENUM("Open", "Closed", "On Hold", "Appeal"),
        defaultValue: "Open",
      },
      openedAt: { type: S.DATEONLY, defaultValue: S.NOW },
      closedAt: { type: S.DATEONLY, allowNull: true },
      description: { type: S.TEXT },
      createdAt: { type: S.DATE, defaultValue: S.NOW },
      updatedAt: { type: S.DATE, defaultValue: S.NOW },
    });

    await q.addConstraint("Cases", {
      fields: ["firmId", "caseNumber"],
      type: "unique",
      name: "uq_cases_firm_caseNumber",
    });
    await q.addIndex("Cases", ["clientId"]);
  },
  async down(q) {
    await q.dropTable("Cases");
  },
};
