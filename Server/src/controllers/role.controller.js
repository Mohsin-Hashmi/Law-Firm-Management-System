const { Role, Permission } = require("../models");
const createRole = async () => {
  try {
    const { name, permissions } = req.body;
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res
        .status(400)
        .json({ success: false, message: "Role already exists" });
    }
    const newRole = await Role.create({ name });
    if (permissions && permissions.length > 0) {
      const perms = await Permission.findAll({ where: { name: permissions } });
      await newRole.addPermissions(perms); // Sequelize handles role_permissions table
    }

    return res.json({ success: true, role: newRole });
  } catch (error) {}
};

const getPermissions = async (req, res) => {
  try {
    try {
      const permissions = await Permission.findAll();
      res.json({ success: true, permissions });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch permissions" });
    }
  } catch (error) {}
};

module.exports = {
  createRole,
  getPermissions,
};
