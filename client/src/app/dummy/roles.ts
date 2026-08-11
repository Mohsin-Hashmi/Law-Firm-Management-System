import { demoPermissionRecords, demoPermissions } from "./permissions";

export const demoRoles = [
  {
    id: 1,
    name: "Firm Admin",
    permissions: demoPermissionRecords,
  },
  {
    id: 2,
    name: "Lawyer",
    permissions: demoPermissionRecords.filter((permission) =>
      [
        "read_client",
        "create_client",
        "read_case",
        "create_case",
        "view_case_status",
        "view_case_documents",
        "upload_case_document",
        "view_stats",
      ].includes(permission.name)
    ),
  },
  {
    id: 3,
    name: "Client",
    permissions: demoPermissionRecords.filter((permission) =>
      [
        "read_case",
        "view_case_status",
        "view_case_documents",
        "upload_case_document",
        "view_stats",
      ].includes(permission.name)
    ),
  },
  {
    id: 4,
    name: "Case Coordinator",
    permissions: demoPermissionRecords.filter((permission) =>
      [
        "read_client",
        "read_lawyer",
        "read_case",
        "update_case",
        "view_case_documents",
        "upload_case_document",
        "view_stats",
      ].includes(permission.name)
    ),
  },
];

export const demoUsersWithRoles = [
  {
    id: 1,
    name: "Jordan Pierce",
    email: "admin@northmanlegal.demo",
    firmId: 101,
    status: "active",
    role: demoRoles[0],
    permissions: demoPermissions,
  },
  {
    id: 201,
    name: "Avery Mitchell",
    email: "avery.mitchell@northmanlegal.demo",
    firmId: 101,
    status: "active",
    role: demoRoles[1],
    permissions: demoRoles[1].permissions.map((permission) => permission.name),
  },
  {
    id: 202,
    name: "Maya Chen",
    email: "maya.chen@northmanlegal.demo",
    firmId: 101,
    status: "active",
    role: demoRoles[1],
    permissions: demoRoles[1].permissions.map((permission) => permission.name),
  },
  {
    id: 301,
    name: "Olivia Harper",
    email: "olivia.harper@example.demo",
    firmId: 101,
    status: "active",
    role: demoRoles[2],
    permissions: demoRoles[2].permissions.map((permission) => permission.name),
  },
  {
    id: 601,
    name: "Elena Foster",
    email: "elena.foster@northmanlegal.demo",
    firmId: 101,
    status: "active",
    role: demoRoles[3],
    permissions: demoRoles[3].permissions.map((permission) => permission.name),
  },
];

export const getDemoUserById = (id: number | string) =>
  demoUsersWithRoles.find((user) => user.id === Number(id)) || null;
