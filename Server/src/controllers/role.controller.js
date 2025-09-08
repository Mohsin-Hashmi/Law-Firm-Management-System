const dotenv= require("dotenv");
dotenv.config();
const bcrypt= require('bcryptjs');
const { Role, Permission, User } = require("../models");
const { Op } = require("sequelize");
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


// Create User with Role

const createUserWithRole = async (req, res) => {
  try {
    const { name, email, roleId } = req.body;

    // Validate input
    if (!name || !email || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and roleId are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }
    // Get dummy password from env
    const dummyPassword = process.env.DUMMY_PASSWORD;
    if (!dummyPassword) {
      return res.status(500).json({
        success: false,
        message: "Dummy password not set in environment variables",
      });
    }

    // 

    // Hash the dummy password
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
      mustChangePassword: true, // force user to change password on first login
    });

    // Optional: fetch assigned permissions
    const permissions = await role.getPermissions();

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.roleId,
        permissions: permissions.map((p) => p.name),
      },
      message: `User created successfully. Initial password: ${dummyPassword}`,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

const getRoles = async (req, res) => {
  try {
    const excludedRoles = ["Super Admin", "Firm Admin", "Lawyer", "Client"];

    const roles = await Role.findAll({
      attributes: ["id", "name"],
      where: {
        name: {
          [Op.notIn]: excludedRoles, // exclude these
        },
      },
    });

    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};


module.exports = {
  createRole,
  getPermissions,
  assignPermissionToRole,
  createUserWithRole,
  getRoles
};
