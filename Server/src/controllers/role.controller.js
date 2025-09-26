const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const { Role, Permission, User, UserFirm, Firm } = require("../models");
const { Op } = require("sequelize");

const getActiveFirmId = (req) => {
  return (
    req.user?.activeFirmId || (req.user?.firmIds ? req.user.firmIds[0] : null)
  );
};

// ================== ROLE APIs ==================

// Create Role (global, but assign to firm via UserFirm)
const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const firmId = getActiveFirmId(req);

    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm ID not found" });

    // Check if this role already exists globally (roles are global)
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole)
      return res
        .status(400)
        .json({ success: false, message: "Role already exists" });

    const newRole = await Role.create({ name });

    if (permissions?.length > 0) {
      const perms = await Permission.findAll({ where: { name: permissions } });
      await newRole.addPermissions(perms);
    }

    // DO NOT create UserFirm here — firm association happens only when a user is assigned this role

    return res.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Error in creating role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create role",
      error: error.message,
    });
  }
};


// Get Roles (firm-scoped via UserFirm)
const getRoles = async (req, res) => {
  try {
    const userFirmIds = req.user?.firmIds;
    if (!userFirmIds || userFirmIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No firms associated with user" });
    }

    const excludedRoles = ["Super Admin", "Firm Admin", "Lawyer", "Client"];

    // Fetch UserFirm records for the user's firms
    const userFirms = await UserFirm.findAll({
      where: { firmId: userFirmIds },
      include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
    });

    // Map roles per firm
    const rolesByFirm = {};
    userFirms.forEach((uf) => {
      if (uf.role && !excludedRoles.includes(uf.role.name)) {
        if (!rolesByFirm[uf.firmId]) rolesByFirm[uf.firmId] = [];
        // Prevent duplicate roles in the same firm
        if (!rolesByFirm[uf.firmId].some((r) => r.id === uf.role.id)) {
          rolesByFirm[uf.firmId].push(uf.role);
        }
      }
    });

   return res.status(200).json({ success: true, roles: rolesByFirm[firmId] || [] });

  } catch (error) {
    console.error("Get roles error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch roles" });
  }
};


// ================== PERMISSIONS APIs ==================

const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json({ success: true, permissions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch permissions" });
  }
};

const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionName } = req.body;
    const firmId = getActiveFirmId(req);

    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm ID not found" });

    const roleAssigned = await UserFirm.findOne({ where: { firmId, roleId } });
    if (!roleAssigned)
      return res
        .status(404)
        .json({ success: false, message: "Role not found in your firm" });

    const permission = await Permission.findOne({
      where: { name: permissionName },
    });
    if (!permission)
      return res
        .status(404)
        .json({ success: false, message: "Permission not found" });

    const role = await Role.findByPk(roleId);
    await role.addPermission(permission);

    return res.json({
      success: true,
      message: `Permission '${permissionName}' assigned`,
    });
  } catch (err) {
    console.error("Assign permission error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign permission" });
  }
};

// ================== USER APIs ==================

// Create User with Role (firm-scoped via UserFirm)
const createUserWithRole = async (req, res) => {
  try {
    const { name, email, roleId } = req.body;
    const firmId = getActiveFirmId(req);

    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm ID not found" });
    if (!name || !email || !roleId)
      return res.status(400).json({
        success: false,
        message: "Name, email, and roleId are required",
      });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });

    // Make sure role is assigned to this firm (UserFirm table)
    const roleAssigned = await UserFirm.findOne({ where: { firmId, roleId } });
    if (roleAssigned)
      return res.status(400).json({
        success: false,
        message: "Role already assigned to this firm",
      });

    const dummyPassword = process.env.DUMMY_PASSWORD;
    if (!dummyPassword)
      return res
        .status(500)
        .json({ success: false, message: "Dummy password not set in env" });

    const hashedPassword = await bcrypt.hash(dummyPassword, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
      mustChangePassword: true,
    });

    await UserFirm.create({ userId: newUser.id, firmId, roleId });

    const role = await Role.findByPk(roleId);
    const permissions = await role.getPermissions();

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.roleId,
        firmId,
        permissions: permissions.map((p) => p.name),
      },
      message: `User created successfully. Initial password: ${dummyPassword}`,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create user" });
  }
};

// Get Users by Firm
const getUsersByFirm = async (req, res) => {
  try {
    const firmId = getActiveFirmId(req);
    if (!firmId)
      return res
        .status(400)
        .json({ success: false, message: "Firm ID not found" });

    const userFirms = await UserFirm.findAll({
      where: { firmId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["id", "name"],
              include: [
                {
                  model: Permission,
                  as: "permissions",
                  attributes: ["name"],
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
      ],
    });

    const users = userFirms
      .filter((uf) => uf.user)
      .map((uf) => ({
        id: uf.user.id,
        name: uf.user.name,
        email: uf.user.email,
        role: uf.user.role
          ? { id: uf.user.role.id, name: uf.user.role.name }
          : null,
        permissions: uf.user.role
          ? uf.user.role.permissions.map((p) => p.name)
          : [],
        status: uf.status,
      }));

    const firm = await Firm.findByPk(firmId);
    return res
      .status(200)
      .json({ success: true, firm: { id: firm.id, name: firm.name }, users });
  } catch (error) {
    console.error("Error fetching users by firm:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch users" });
  }
};

// Delete User by Firm
const deleteUserByFirm = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getActiveFirmId(req);

    const userFirm = await UserFirm.findOne({ where: { userId: id, firmId } });
    if (!userFirm)
      return res.status(404).json({ message: "User not found in your firm" });

    await userFirm.destroy();
    const remainingFirms = await UserFirm.findOne({ where: { userId: id } });
    if (!remainingFirms) await User.destroy({ where: { id } });

    res.json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.error("Error deleting user from firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update User by Firm
const updateUserByFirm = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getActiveFirmId(req);
    const {
      status,
      roleId,
      addPermissions = [],
      removePermissions = [],
    } = req.body;

    const userFirm = await UserFirm.findOne({
      where: { userId: id, firmId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });
    if (!userFirm)
      return res
        .status(404)
        .json({ success: false, message: "UserFirm not found in your firm" });

    if (status) {
      userFirm.status = status;
      await userFirm.save();
    }
    if (roleId) {
      userFirm.roleId = roleId;
      await userFirm.save();
    }

    let currentRole = null;
    if (userFirm.roleId)
      currentRole = await Role.findByPk(userFirm.roleId, {
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      });

    if (
      currentRole &&
      (addPermissions.length > 0 || removePermissions.length > 0)
    ) {
      if (addPermissions.length > 0) {
        const permsToAdd = await Permission.findAll({
          where: { name: addPermissions },
        });
        await currentRole.addPermissions(permsToAdd);
      }
      if (removePermissions.length > 0) {
        const permsToRemove = await Permission.findAll({
          where: { name: removePermissions },
        });
        await currentRole.removePermissions(permsToRemove);
      }

      currentRole = await Role.findByPk(userFirm.roleId, {
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      });
    }

    return res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: userFirm.user?.id,
        name: userFirm.user?.name,
        email: userFirm.user?.email,
        firmId: userFirm.firmId,
        role: currentRole
          ? {
              id: currentRole.id,
              name: currentRole.name,
              permissions: currentRole.permissions.map((p) => p.name),
            }
          : null,
        status: userFirm.status,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Single User by Firm
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const firmId = getActiveFirmId(req);

    const userFirm = await UserFirm.findOne({
      where: { userId: id, firmId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!userFirm)
      return res
        .status(404)
        .json({ success: false, message: "User not found in your firm" });

    return res.json({
      success: true,
      user: {
        id: userFirm.user?.id,
        name: userFirm.user?.name,
        email: userFirm.user?.email,
        firmId: userFirm.firmId,
        role: userFirm.role
          ? {
              id: userFirm.role.id,
              name: userFirm.role.name,
              permissions: userFirm.role.permissions.map((p) => p.name),
            }
          : null,
        status: userFirm.status,
      },
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createRole,
  getRoles,
  getPermissions,
  assignPermissionToRole,
  createUserWithRole,
  getUsersByFirm,
  deleteUserByFirm,
  updateUserByFirm,
  getUserById,
};
