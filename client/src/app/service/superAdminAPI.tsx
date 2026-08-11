import axios from "axios";
import BASE_URL from "../utils/constant";
import { SubscriptionPayload } from "../types/firm";
import { IS_DEMO_MODE } from "../utils/demoMode";
import { getDemoCasesByFirm } from "../dummy/cases";
import { demoClients, getDemoClientById } from "../dummy/clients";
import { demoFirms, getDemoFirmById } from "../dummy/firms";
import { demoLawyers, getDemoLawyerById } from "../dummy/lawyers";
import { buildClientStats, buildPlatformOverview, demoDelay } from "../dummy/responses";

/** ------------------ FIRM APIS ------------------ **/

// Get all firms
export const getAllFirms = async () => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, firms: demoFirms });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/firms`, {
    withCredentials: true,
  });
  return response.data;
};

// Get firm by ID
export const getFirmById = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, firm: getDemoFirmById(id) });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/firm/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update firm status (e.g., active/inactive)
export const updateFirmStatus = async (id: number, status: string) => {
  if (IS_DEMO_MODE) {
    return demoDelay({
      success: true,
      message: "Demo firm status updated",
      firm: { ...getDemoFirmById(id), status },
    });
  }

  const response = await axios.patch(
    `${BASE_URL}/super-admin/firms/${id}/status`,
    { status }, // <-- body required
    { withCredentials: true }
  );
  return response.data;
};

// Update firm subscription
export const updateFirmSubscription = async (id: number, subscription: SubscriptionPayload) => {
  if (IS_DEMO_MODE) {
    return demoDelay({
      success: true,
      message: "Demo subscription updated",
      firm: { ...getDemoFirmById(id), subscription_plan: subscription.plan },
    });
  }

  const response = await axios.patch(
    `${BASE_URL}/super-admin/firm/${id}/subscription`,
    subscription, // pass subscription object {plan, duration, ...}
    { withCredentials: true }
  );
  return response.data;
};

// Delete firm
export const deleteFirm = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, message: "Demo firm deleted" });
  }

  const response = await axios.delete(`${BASE_URL}/super-admin/firm/${id}`, {
    withCredentials: true,
  });
  return response.data;
};


/** ------------------ LAWYER APIS ------------------ **/

// Get all lawyers
export const getAllLawyers = async () => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, lawyers: demoLawyers });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/lawyers`, {
    withCredentials: true,
  });
  return response.data;
};

// Get lawyer by ID
export const getLawyerById = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, lawyer: getDemoLawyerById(id) });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/lawyer/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update lawyer status only
export const updateLawyerStatus = async (id: number, status: string) => {
  if (IS_DEMO_MODE) {
    return demoDelay({
      success: true,
      message: "Demo lawyer status updated",
      lawyer: { ...getDemoLawyerById(id), status },
    });
  }

  const response = await axios.patch(
    `${BASE_URL}/super-admin/lawyer/${id}/status`,
    { status },
    { withCredentials: true }
  );
  return response.data;
};

// Delete lawyer
export const deleteLawyer = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, message: "Demo lawyer deleted" });
  }

  const response = await axios.delete(
    `${BASE_URL}/super-admin/lawyer/${id}`,
    { withCredentials: true }
  );
  return response.data;
};


/** ------------------ CLIENT APIS ------------------ **/

// Get all clients
export const getAllClients = async () => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, clients: demoClients });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/clients`, {
    withCredentials: true,
  });
  return response.data;
};

// Get client by ID
export const getClientById = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, client: getDemoClientById(id) });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/client/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Delete client
export const deleteClient = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, message: "Demo client deleted" });
  }

  const response = await axios.delete(
    `${BASE_URL}/super-admin/client/${id}`,
    { withCredentials: true }
  );
  return response.data;
};

export const getClientPerformanceSuperAdmin = async (id: number) => {
  if (IS_DEMO_MODE) {
    return demoDelay(buildClientStats(id));
  }

  const response = await axios.get(`${BASE_URL}/super-admin/${id}/performance`, {
    withCredentials: true,
  });
  return response.data;
};

// Update client status only
export const updateClientStatus = async (id: number, status: string) => {
  if (IS_DEMO_MODE) {
    return demoDelay({
      success: true,
      message: "Demo client status updated",
      client: { ...getDemoClientById(id), status },
    });
  }

  const response = await axios.patch(
    `${BASE_URL}/super-admin/client/${id}/status`,
    { status },
    { withCredentials: true }
  );
  return response.data;
};


/** ------------------ CASES & PLATFORM APIS ------------------ **/

// Get case metadata (stats)
export const getCaseMetadata = async () => {
  if (IS_DEMO_MODE) {
    const cases = demoFirms.flatMap((firm) => getDemoCasesByFirm(firm.id));
    return demoDelay({
      totalCases: cases.length,
      openCases: cases.filter((caseItem) => caseItem.status === "Open").length,
      closedCases: cases.filter((caseItem) => caseItem.status === "Closed").length,
    });
  }

  const response = await axios.get(`${BASE_URL}/super-admin/cases/metadata`, {
    withCredentials: true,
  });
  return response.data;
};

// Get platform overview stats
export const getPlatformOverview = async () => {
  if (IS_DEMO_MODE) {
    return demoDelay(buildPlatformOverview());
  }

  const response = await axios.get(`${BASE_URL}/super-admin/platform/overview`, {
    withCredentials: true,
  });
  return response.data;
};
