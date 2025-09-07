const { Role, Permission } = require("../models");
const createRole = async (req, res) => {
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
  } catch (error) {
    console.error("Error in creating role:", err);
    res.status(500).json({ success: false, message: "Failed to create role" });
  }
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

const assignPermissionToRole = async (req, res) => {
  try {
    const { roleName, permissionName } = req.body;

    if (!roleName || !permissionName) {
      return res
        .status(400)
        .json({
          success: false,
          message: "roleName and permissionName are required",
        });
    }

    const role = await Role.findOne({ where: { name: roleName } });
    const permission = await Permission.findOne({
      where: { name: permissionName },
    });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: `Role '${roleName}' not found` });
    }
    if (!permission) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Permission '${permissionName}' not found`,
        });
    }

    await role.addPermission(permission);

    return res.json({
      success: true,
      message: `Permission '${permissionName}' assigned to role '${roleName}'`,
    });
  } catch (err) {
    console.error("Assign permission error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign permission" });
  }
};

module.exports = {
  createRole,
  getPermissions,
  assignPermissionToRole,
};
