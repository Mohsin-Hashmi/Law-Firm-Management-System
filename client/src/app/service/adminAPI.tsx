import axios from "axios";
import BASE_URL from "../utils/constant";
import { FirmPayload, LawyerPayload, FirmStats } from "../types/firm";

/**Create firm API call */
export const createFirm = async (data: FirmPayload) => {
  const response = await axios.post(`${BASE_URL}/api/firm-admin/firm`, data, {
    withCredentials: true,
  });
  return response;
};

/**Add Layer API */
export const addLawyer = async (firmId: string, data: FormData) => {
  const response = await axios.post(
    `${BASE_URL}/api/firm-admin/${firmId}/addlawyers`,
    data,
    {
      withCredentials: true,
    }
  );
  return response;
};

/**Get Frim Stats */

export const getStats = async (firmId: string): Promise<FirmStats> => {
  console.log("Fetching stats for firmId:", firmId); // <--- make sure this prints
  const response = await axios.get(`${BASE_URL}/api/firm-admin/firms/${firmId}`, {
    withCredentials: true,
  });
  console.log("stats data:", response.data);
  return response.data;
};
