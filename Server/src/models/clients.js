module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define("Client", {
    fullName: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY },
    gender: { type: DataTypes.ENUM("Male", "Female", "Other") },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: DataTypes.TEXT,
    clientType: {
      type: DataTypes.ENUM("Individual", "Business", "Corporate"),
      defaultValue: "Individual",
    },
    organization: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("Active", "Past", "Potential", "Suspended"),
      defaultValue: "Active",
    },
    billingAddress: DataTypes.TEXT,
    outstandingBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

    // 🆕 Profile Image (URL or Path)
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
  });

  Client.associate = (models) => {
    Client.belongsTo(models.Firm, { foreignKey: "firmId", as: "firm" });
    Client.belongsToMany(models.Lawyer, {
      through: "ClientLawyers",
      as: "lawyers",
      foreignKey: "clientId",
    });
    Client.hasMany(models.Case, { foreignKey: "clientId", as: "cases" });
    Client.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return Client;
};
