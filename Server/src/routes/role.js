const express = require("express");
const roleRouter = express.Router();
const {
  createRole,
  getPermissions,
  assignPermissionToRole
} = require("../controllers/role.controller");
const { userAuth, firmAdminAuth, superAdminAuth } = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermission");
const permissions = require("../constants/permissions");

roleRouter.post(
  "/create-role",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.CREATE_ROLE),
  createRole
);
roleRouter.get("/get-permissions", userAuth, firmAdminAuth, getPermissions)
roleRouter.post("/assign-permission",userAuth, checkPermission(permissions.CREATE_ROLE), assignPermissionToRole)

module.exports = roleRouter;
