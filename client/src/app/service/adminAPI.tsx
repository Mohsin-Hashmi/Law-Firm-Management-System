import axios from "axios";
import BASE_URL from "../utils/constant";
import { FirmPayload, LawyerPayload, FirmStats, Lawyer } from "../types/firm";

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
export const getStats = async (firmId?: string): Promise<FirmStats> => {
  try {
    console.log("Fetching stats... firmId:", firmId);

    // If Super Admin -> requires firmId param
    const url = firmId
      ? `${BASE_URL}/api/super-admin/firms/${firmId}/stats`
      : `${BASE_URL}/api/firm-admin/firms/stats`;

    const response = await axios.get(url, {
      withCredentials: true,
    });

    console.log("Stats data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

export const getLawyers = async (): Promise<Lawyer[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/firm-admin/firms/lawyers`,
      {
        withCredentials: true,
      }
    );

    console.log("lawyers response:", response.data);

    // return only the array
    return response.data.allLawyers;
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    return [];
  }
};

/** Get Lawyer by ID */
export const getLawyerById = async (id: string): Promise<Lawyer | null> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/firm-admin/firm/lawyer/${id}`,
      {
        withCredentials: true,
      }
    );

    console.log("lawyer detail response:", response.data);
    // Adjust this return depending on backend response structure
    return response.data.lawyer || response.data;
  } catch (error) {
    console.error("Error fetching lawyer by id:", error);
    return null;
  }
};

/** Delete Lawyer by ID */
export const deleteLawyer = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/firm-admin/firm/lawyer/${id}`,
      {
        withCredentials: true,
      }
    );

    console.log("Delete lawyer response:", response.data);
    return response.data; // { success: true, message: "Lawyer deleted successfully" }
  } catch (error) {
    console.error("Error deleting lawyer:", error);
    throw error;
  }
};

export const updateLawyer = async (
  id: number,
  lawyerData: Partial<Lawyer>, // we only update some fields
  file?: File // optional new profile image
): Promise<Lawyer> => {
  try {
    const formData = new FormData();

    // Append text fields if provided
    if (lawyerData.name) formData.append("name", lawyerData.name);
    if (lawyerData.email) formData.append("email", lawyerData.email);
    if (lawyerData.phone) formData.append("phone", lawyerData.phone);
    if (lawyerData.specialization)
      formData.append("specialization", lawyerData.specialization);
    if (lawyerData.status) formData.append("status", lawyerData.status);

    // Append file if provided
    if (file) {
      formData.append("profileImage", file);
    }

    const response = await axios.put(
      `${BASE_URL}/api/firm-admin/firm/lawyer/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating lawyer:", error);
    throw error;
  }
};
