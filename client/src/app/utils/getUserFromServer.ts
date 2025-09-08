// /pages/api/auth/me.ts  (if using Pages Router)
// or /app/api/auth/me/route.ts (if using App Router)
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import BASE_URL from "@/app/utils/constant";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Cookie: req.headers.cookie || "",
      },
      withCredentials: true,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Error in auth/me api ", error);
  }
}
