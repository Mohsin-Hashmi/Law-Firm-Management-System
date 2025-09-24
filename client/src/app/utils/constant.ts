// utils/constant.ts (or constant.js)

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://law-firm-management-system-git-main-mohsins-projects-0662fa42.vercel.app/api"
    : "http://localhost:5000/api";

export default BASE_URL;
