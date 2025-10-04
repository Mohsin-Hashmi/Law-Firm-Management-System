import axios from "axios";
import BASE_URL from "../utils/constant";
import { SubscriptionPayload } from "../types/firm";

/** ------------------ FIRM APIS ------------------ **/

// Get all firms
export const getAllFirms = async () => {
  const response = await axios.get(`${BASE_URL}/super-admin/firms`, {
    withCredentials: true,
  });
  return response.data;
};

// Get firm by ID
export const getFirmById = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/super-admin/firm/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update firm status (e.g., active/inactive)
export const updateFirmStatus = async (id: number, status: string) => {
  const response = await axios.patch(
    `${BASE_URL}/super-admin/firms/${id}/status`,
    { status }, // <-- body required
    { withCredentials: true }
  );
  return response.data;
};

// Update firm subscription
export const updateFirmSubscription = async (id: number, subscription: SubscriptionPayload) => {
  const response = await axios.patch(
    `${BASE_URL}/super-admin/firm/${id}/subscription`,
    subscription, // pass subscription object {plan, duration, ...}
    { withCredentials: true }
  );
  return response.data;
};

// Delete firm
export const deleteFirm = async (id: number) => {
  const response = await axios.delete(`${BASE_URL}/super-admin/firm/${id}`, {
    withCredentials: true,
  });
  return response.data;
};


/** ------------------ LAWYER APIS ------------------ **/

// Get all lawyers
export const getAllLawyers = async () => {
  const response = await axios.get(`${BASE_URL}/super-admin/lawyers`, {
    withCredentials: true,
  });
  return response.data;
};

// Get lawyer by ID
export const getLawyerById = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/super-admin/lawyer/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update lawyer status only
export const updateLawyerStatus = async (id: number, status: string) => {
  const response = await axios.patch(
    `${BASE_URL}/super-admin/lawyer/${id}/status`,
    { status },
    { withCredentials: true }
  );
  return response.data;
};

// Delete lawyer
export const deleteLawyer = async (id: number) => {
  const response = await axios.delete(
    `${BASE_URL}/super-admin/lawyer/${id}`,
    { withCredentials: true }
  );
  return response.data;
};


/** ------------------ CLIENT APIS ------------------ **/

// Get all clients
export const getAllClients = async () => {
  const response = await axios.get(`${BASE_URL}/super-admin/clients`, {
    withCredentials: true,
  });
  return response.data;
};

// Get client by ID
export const getClientById = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/super-admin/client/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Delete client
export const deleteClient = async (id: number) => {
  const response = await axios.delete(
    `${BASE_URL}/super-admin/client/${id}`,
    { withCredentials: true }
  );
  return response.data;
};

export const getClientPerformanceSuperAdmin = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/super-admin/${id}/performance`, {
    withCredentials: true,
  });
  return response.data;
};


/** ------------------ CASES & PLATFORM APIS ------------------ **/

// Get case metadata (stats)
export const getCaseMetadata = async () => {
  const response = await axios.get(`${BASE_URL}/super-admin/cases/metadata`, {
    withCredentials: true,
  });
  return response.data;
};

// Get platform overview stats
export const getPlatformOverview = async () => {
  const response = await axios.get(`${BASE_URL}/super-admin/platform/overview`, {
    withCredentials: true,
  });
  return response.data;
};
