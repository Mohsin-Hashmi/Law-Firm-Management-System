// utils/constant.ts (or constant.js)

// Prefer explicit public env for client-side requests
// Example: NEXT_PUBLIC_API_URL=https://your-api.example.com
const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Fallbacks based on NODE_ENV if env not set
const fallbackApiUrl =
  process.env.NODE_ENV === "production"
    ? "" // No sensible default in prod; must be provided via env
    : "http://localhost:5000";

const BASE_URL = explicitApiUrl || fallbackApiUrl;

export default BASE_URL;

