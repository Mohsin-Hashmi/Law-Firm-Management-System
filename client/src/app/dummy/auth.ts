import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_SUPER_ADMIN_EMAIL,
  DEMO_SUPER_ADMIN_PASSWORD,
} from "../utils/demoMode";
import { demoPermissions } from "./permissions";

export const demoAuthUsers = [
  {
    id: 1,
    name: "Jordan Pierce",
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    role: "Firm Admin",
    mustChangePassword: false,
    permissions: demoPermissions,
    firms: [{ id: 101, name: "Northman Legal Group" }],
    activeFirmId: 101,
    firmId: 101,
    statusMessage: "Northman Legal Group is active on the platform.",
  },
  {
    id: 900,
    name: "Morgan Blake",
    email: DEMO_SUPER_ADMIN_EMAIL,
    password: DEMO_SUPER_ADMIN_PASSWORD,
    role: "Super Admin",
    mustChangePassword: false,
    permissions: demoPermissions,
    firms: [],
    activeFirmId: null,
    firmId: undefined,
    statusMessage: "Platform demo mode is active.",
  },
];

export const demoToken = "demo-portfolio-token";

export const findDemoUser = (email: string, password: string) =>
  demoAuthUsers.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
  );
