const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL;

const fallbackApiUrl =
  process.env.NODE_ENV === "production"
    ? "http://13.60.35.167:5000" 
    : "http://localhost:5000";

const BASE_URL = explicitApiUrl || fallbackApiUrl;

export default BASE_URL;
