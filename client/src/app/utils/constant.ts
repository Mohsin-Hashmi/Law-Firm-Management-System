// utils/constant.ts (or constant.js)

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://legal-law-firm-management-system.vercel.app"
    : "http://localhost:5000";

export default BASE_URL;

