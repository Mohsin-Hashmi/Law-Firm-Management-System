const express = require("express");
const roleRouter = express.Router();
const {
  createRole,
  getPermissions,
  assignPermissionToRole,
  createUserWithRole,
  getRoles
} = require("../controllers/role.controller");
const {
  userAuth,
  firmAdminAuth,
  superAdminAuth,
} = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermission");
const permissions = require("../constants/permissions");

roleRouter.post(
  "/create-role",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.CREATE_ROLE),
  createRole
);
roleRouter.get("/get-permissions", userAuth, firmAdminAuth, getPermissions);
roleRouter.post(
  "/assign-permission",
  userAuth,
  checkPermission(permissions.CREATE_ROLE),
  assignPermissionToRole
);
roleRouter.post(
  "/assign-role",
  userAuth,
  firmAdminAuth,
  checkPermission(permissions.ASSIGN_ROLE),
  createUserWithRole
);

roleRouter.get(
  "/get-roles",
  userAuth, 
  firmAdminAuth,
  getRoles
);

module.exports = roleRouter;
