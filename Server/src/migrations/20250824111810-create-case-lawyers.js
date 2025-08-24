"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("CaseLawyers", {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      caseId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "CASCADE",
      },
      lawyerId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Lawyers", key: "id" },
        onDelete: "CASCADE",
      },
      role: { type: S.STRING }, // e.g., "Lead Counsel", "Associate"
      createdAt: { type: S.DATE, defaultValue: S.NOW },
      updatedAt: { type: S.DATE, defaultValue: S.NOW },
    });
    await q.addConstraint("CaseLawyers", {
      fields: ["caseId", "lawyerId"],
      type: "unique",
      name: "uq_case_lawyer",
    });
  },
  async down(q) {
    await q.dropTable("CaseLawyers");
  },
};
