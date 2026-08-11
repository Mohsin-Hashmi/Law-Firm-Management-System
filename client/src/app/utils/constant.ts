import { IS_DEMO_MODE } from "./demoMode";

const BASE_URL = IS_DEMO_MODE
  ? ""
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export default BASE_URL;
