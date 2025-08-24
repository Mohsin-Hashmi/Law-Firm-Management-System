"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("Clients", {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      firmId: {
        type: S.INTEGER,
        allowNull: false,
        references: { model: "Firms", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      fullName: { type: S.STRING, allowNull: false },
      email: { type: S.STRING, allowNull: false },
      phone: { type: S.STRING, allowNull: false },
      address: { type: S.TEXT },
      clientType: { type: S.ENUM("Individual", "Business"), defaultValue: "Individual" },
      organization: { type: S.STRING },
      status: { type: S.ENUM("Active", "Past", "Potential", "Suspended"), defaultValue: "Active" },
      billingAddress: { type: S.TEXT },
      outstandingBalance: { type: S.DECIMAL(10,2), defaultValue: 0.0 },
      dob: { type: S.DATEONLY },
      gender: { type: S.ENUM("Male", "Female", "Other") },
      createdAt: { type: S.DATE, defaultValue: S.NOW },
      updatedAt: { type: S.DATE, defaultValue: S.NOW },
    });

    // unique per firm
    await q.addConstraint("Clients", {
      fields: ["firmId", "email"],
      type: "unique",
      name: "uq_clients_firm_email",
    });
  },
  async down(q) {
    await q.dropTable("Clients");
  },
};
