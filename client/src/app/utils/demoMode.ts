export const IS_DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === undefined
    ? true
    : process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_ADMIN_EMAIL = "admin@northmanlegal.demo";
export const DEMO_ADMIN_PASSWORD = "DemoAdmin123!";
export const DEMO_SUPER_ADMIN_EMAIL = "superadmin@northmanlegal.demo";
export const DEMO_SUPER_ADMIN_PASSWORD = "DemoSuper123!";
