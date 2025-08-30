import axios from "axios";
import BASE_URL from "../utils/constant";
import { FirmPayload, LawyerPayload, FirmStats, Lawyer } from "../types/firm";
import { ClientPayload, Client } from "../types/client";

/**Create firm API call */
export const createFirm = async (data: FirmPayload) => {
  const response = await axios.post(`${BASE_URL}/api/firm-admin/firm`, data, {
    withCredentials: true,
  });
  return response;
};

/**Add Lawyer API */
export const addLawyer = async (firmId: number, data: FormData) => {
  if (!firmId) throw new Error("firmId is required");
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
export const getStats = async (
  firmId?: number,
  role?: string
): Promise<FirmStats> => {
  try {
    console.log("Fetching stats... firmId:", firmId, "role:", role);

    let url = "";

    if (role === "Super Admin") {
      if (!firmId) throw new Error("Firm ID is required for Super Admin");
      url = `${BASE_URL}/api/firm-admin/firms/${firmId}/stats`; // ✅ pass firmId
    } else if (role === "Firm Admin") {
      url = `${BASE_URL}/api/firm-admin/firms/${firmId}/stats`; // ✅ firmId auto-resolved from token
    } else {
      throw new Error("Invalid role or missing firmId");
    }

    console.log("📡 Calling stats API:", url);
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

export const getLawyers = async (firmId?: number): Promise<Lawyer[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/firm-admin/firms/lawyers`,
      {
        params: { firmId }, // <-- pass firmId in query
        withCredentials: true,
      }
    );

    console.log("lawyers response:", response.data);

    return response.data.allLawyers;
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    return [];
  }
};

/** Get Lawyer by ID */
export const getLawyerById = async (id: number): Promise<Lawyer | null> => {
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

// Switch firm API
export const switchFirmAPI = async (firmId: number) => {
  const res = await axios.post(
    `${BASE_URL}/api/firm-admin/switch-firm`,
    { firmId },
    { withCredentials: true }
  );
  return res.data;
};

/**Create Client API Call */
export const createClient = async (firmId: number, data: FormData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/firm-admin/${firmId}/addClient`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // AxiosError type-safe handling
      throw new Error(
        `Error creating client: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    // Fallback for unexpected errors
    throw new Error("Unexpected error while creating client");
  }
};

/**Get All Clients API Call */
export const getAllClients = async (firmId: number): Promise<Client[]> => {
  try {
    const response = await axios.get<{ clients: Client[] }>(
      `${BASE_URL}/api/firm-admin/firm/${firmId}/clients`,
      { withCredentials: true }
    );

    return response.data.clients;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching clients: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

/**Get Client by id API Call */
export const getClientById = async (id: number) => {
  try {
    const response = await axios.get<{
      success: boolean;
      message: string;
      client: Client;
    }>(`${BASE_URL}/api/firm-admin/firm/client/${id}`, {
      withCredentials: true,
    });
    const data = response.data.client;
    return {
      ...data,
      outstandingBalance: Number(data.outstandingBalance ?? 0),
    } as Client;
  } catch (error) {
    throw new Error("Error fetching client by ID: " + error);
  }
};

export const updateClient = async (id: number, data: ClientPayload) => {
  try {
    const response = await axios.put<{ message: string }>(
      `${BASE_URL}/api/firm-admin/firm/client/${id}`,
      data,
      {
        withCredentials: true,
      }
    );
    console.log("update client api response is ", response);
    return response.data; // { message: string }
  } catch (error) {
    throw new Error("Error updating client: " + error);
  }
};

export const deleteClient = async (id: number) => {
  try {
    const response = await axios.delete<{ message: string }>(
      `${BASE_URL}/api/firm-admin/firm/client/${id}`,
      {
        withCredentials: true,
      }
    );
    return response.data; // will contain success message
  } catch (error) {
    throw new Error("Error deleting client: " + error);
  }
};

/**
 * Case Related APIs
 */

export const createCase = async (firmId: number, data: FormData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/firm-admin/${firmId}/addCase`,
      data,
      {
        withCredentials: true,
      }
    );
    console.log("create case api response is", response);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating case:",
      error
    );
    throw new Error("Error creating case: " + error);
  }
};
