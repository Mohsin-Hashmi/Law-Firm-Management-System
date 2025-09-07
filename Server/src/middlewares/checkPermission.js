// middlewares/checkPermission.js
const { Role, Permission } = require("../models");

const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role; // from JWT
      if (!userRole) {
        return res.status(403).json({ success: false, error: "Role not found" });
      }
      if (userRole === "Super Admin") {
        return next();
      }
      // Get role with its permissions
      const role = await Role.findOne({
        where: { name: userRole },
        include: [{ model: Permission, as: "permissions" }],
      });

      if (!role) {
        return res.status(403).json({ success: false, error: "Role not found in DB" });
      }

      // Ensure array
      const permsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      // OR logic: user must have **any** of the permissions
      const hasPermission = role.permissions.some((p) =>
        permsArray.includes(p.name)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Permission check failed",
      });
    }
  };
};


module.exports = checkPermission;
