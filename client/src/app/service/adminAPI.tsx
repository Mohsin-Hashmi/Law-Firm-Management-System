import axios from "axios";
import BASE_URL from "../utils/constant";
import api from "../utils/axiosConfig";
import { FirmPayload, LawyerPayload, FirmStats, Lawyer } from "../types/firm";
import { ClientPayload, Client } from "../types/client";
import { Case } from "../types/case";
import { CreateRolePayload } from "../types/role";
import { AssignRolePayload } from "../types/role";
import { ClientStats } from "../types/client";
import {
  UpdateUserPayload,
  UpdateUserResponse,
  GetUserByIdResponse,
} from "../types/user";
import { addFirm, switchFirm } from "../store/userSlice";
import { AppDispatch } from "../store/store";
import { IS_DEMO_MODE } from "../utils/demoMode";
import { getDemoCasesByClient, getDemoCasesByFirm, getDemoCasesByLawyer, getDemoCaseById } from "../dummy/cases";
import { getDemoClientById, getDemoClientsByFirm } from "../dummy/clients";
import { getDemoDocumentsByCase } from "../dummy/documents";
import { demoFirms, getDemoFirmById } from "../dummy/firms";
import { getDemoLawyerById, getDemoLawyersByFirm } from "../dummy/lawyers";
import { demoPermissionRecords } from "../dummy/permissions";
import { demoRoles, demoUsersWithRoles, getDemoUserById } from "../dummy/roles";
import {
  buildClientStats,
  buildFirmStats,
  buildLawyerStats,
  demoAxiosResponse,
  demoDelay,
} from "../dummy/responses";
/**Create firm API call */
export const createFirm =
  (data: FirmPayload, role?: string) => async (dispatch: AppDispatch) => {
    try {
      if (IS_DEMO_MODE) {
        const newFirm = {
          id: 199,
          name: data.name,
        };
        dispatch(addFirm(newFirm));
        dispatch(switchFirm(newFirm.id));

        return demoAxiosResponse({
          success: true,
          message: "Demo firm created",
          newFirm,
          token: "demo-portfolio-token",
        });
      }

      const rolePath = role === "Super Admin" ? "super-admin" : "firm-admin";

      const response = await api.post(`/${rolePath}/firm`, data);

      if (response.data.token) {
        // Update axios default header with the new token
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;

        // Update localStorage with the new token
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("authToken", response.data.token);

        // Update user data in localStorage with new firm info
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          firms: [
            ...(currentUser.firms || []),
            {
              id: response.data.newFirm.id,
              name: response.data.newFirm.name,
            },
          ],
          activeFirmId: response.data.newFirm.id,
          firmId: response.data.newFirm.id,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        const newFirm = {
          id: response.data.newFirm.id,
          name: response.data.newFirm.name,
        };

        dispatch(addFirm(newFirm));
        dispatch(switchFirm(newFirm.id));
      }

      return response;
    } catch (error) {
      console.error("Error creating firm:", error);
      throw error;
    }
  };

export const getMyFirms = async (): Promise<FirmPayload[]> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(demoFirms as FirmPayload[]);
    }

    const response = await api.get("/firm-admin/my-firms");

    console.log("firms response:", response.data);

    return response.data.firms;
  } catch (error) {
    console.error("Error fetching firms:", error);
    return [];
  }
};

export const deleteFirm = async (firmId: number): Promise<boolean> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(true);
    }

    const response = await axios.delete(`${BASE_URL}/firm-admin/delete-firm`, {
      data: { firmId },
      withCredentials: true,
    });

    return response.data.success; // true/false from backend
  } catch (error) {
    console.error("Error deleting firm:", error);
    return false;
  }
};

/**Add Lawyer API */
export const addLawyer = async (firmId: number, data: FormData) => {
  if (!firmId) throw new Error("firmId is required");
  if (IS_DEMO_MODE) {
    return demoAxiosResponse({
      success: true,
      message: "Demo lawyer added",
      lawyer: {
        id: Date.now(),
        firmId,
        name: String(data.get("name") || "New Demo Lawyer"),
        email: String(data.get("email") || "new.lawyer@northmanlegal.demo"),
        phone: String(data.get("phone") || "+1 (312) 555-0199"),
        specialization: String(data.get("specialization") || "General Practice"),
        status: "Active",
        profileImage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  const response = await axios.post(
    `${BASE_URL}/firm-admin/${firmId}/addlawyers`,
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
    if (IS_DEMO_MODE) {
      return demoDelay(buildFirmStats(firmId || 101) as FirmStats);
    }

    console.log("Fetching stats... firmId:", firmId, "role:", role);

    let url = "";

    if (role === "Super Admin") {
      if (!firmId) throw new Error("Firm ID is required for Super Admin");
      url = `${BASE_URL}/firm-admin/firms/${firmId}/stats`; // ✅ pass firmId
    } else if (role === "Firm Admin") {
      url = `${BASE_URL}/firm-admin/firms/${firmId}/stats`; // ✅ firmId auto-resolved from token
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
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoLawyersByFirm(firmId || 101) as Lawyer[]);
    }

    const response = await axios.get(`${BASE_URL}/firm-admin/firms/lawyers`, {
      params: { firmId }, // <-- pass firmId in query
      withCredentials: true,
    });

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
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoLawyerById(id) as Lawyer | null);
    }

    const response = await api.get(`/firm-admin/firm/lawyer/${id}`);

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
    if (IS_DEMO_MODE) {
      return demoDelay({ success: true, message: "Demo lawyer deleted" });
    }

    const response = await axios.delete(
      `${BASE_URL}/firm-admin/firm/lawyer/${id}`,
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
    if (IS_DEMO_MODE) {
      const existing = getDemoLawyerById(id);
      return demoDelay({
        ...existing,
        ...lawyerData,
        id,
        updatedAt: new Date().toISOString(),
      } as Lawyer);
    }

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
      `${BASE_URL}/firm-admin/firm/lawyer/${id}`,
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
  if (IS_DEMO_MODE) {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...currentUser,
      activeFirmId: firmId,
      firmId,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("token", "demo-portfolio-token");
    localStorage.setItem("authToken", "demo-portfolio-token");

    return demoDelay({
      success: true,
      token: "demo-portfolio-token",
      user: updatedUser,
    });
  }

  const res = await api.post("/firm-admin/switch-firm", { firmId });

  // Update token in localStorage if new token is provided
  if (res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("authToken", res.data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    // Update user data in localStorage with new active firm
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...currentUser,
      activeFirmId: firmId,
      firmId: firmId,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  return res.data;
};

export const getLawyerPerformance = async (lawyerId: number | string) => {
  try {
    if (IS_DEMO_MODE) {
      const lawyer = getDemoLawyerById(lawyerId) || getDemoLawyersByFirm(101)[0];
      const cases = getDemoCasesByLawyer(lawyer.id);
      return demoDelay({
        lawyerId: String(lawyer.id),
        name: lawyer.name,
        totalCases: cases.length,
        totalClients: new Set(cases.map((caseItem) => caseItem.client.id)).size,
        completedCases: cases.filter((caseItem) => caseItem.status === "Closed").length,
        activeCases: cases.filter((caseItem) => caseItem.status === "Open").length,
        wonCases: 2,
        lostCases: 0,
        successRate: 92,
      });
    }

    const response = await axios.get(
      `${BASE_URL}/firm-admin/${lawyerId}/performance`,
      {
        withCredentials: true, // only if you are using cookies/sessions
      }
    );
    console.log("lawyer performance api response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching lawyer performance:", error);
    throw error;
  }
};
export const getClientPerformance = async (clientId: number | string) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(buildClientStats(Number(clientId)));
    }

    const response = await axios.get(
      `${BASE_URL}/firm-admin/${clientId}/client/performance`,
      {
        withCredentials: true, // only if you are using cookies/sessions
      }
    );
    console.log("Client performance api response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching client performance:", error);
    throw error;
  }
};

/**Create Client API Call */
export const createClient = async (firmId: number, data: FormData) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        message: "Demo client created",
        client: {
          id: Date.now(),
          firmId,
          fullName: String(data.get("fullName") || "New Demo Client"),
          email: String(data.get("email") || "new.client@example.demo"),
          phone: String(data.get("phone") || "+1 (312) 555-0299"),
          clientType: String(data.get("clientType") || "Individual"),
          status: String(data.get("status") || "Active"),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const response = await axios.post(
      `${BASE_URL}/firm-admin/${firmId}/addClient`,
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
        `Error creating client: ${error.response?.data?.message || error.message
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
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoClientsByFirm(firmId || 101) as Client[]);
    }

    const response = await axios.get<{ clients: Client[] }>(
      `${BASE_URL}/firm-admin/firm/clients`,
      { params: { firmId }, withCredentials: true }
    );

    return response.data.clients;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching clients: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

/**Get Client by id API Call */
export const getClientById = async (id: number) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoClientById(id) as Client);
    }

    const response = await axios.get<{
      success: boolean;
      message: string;
      client: Client;
    }>(`${BASE_URL}/firm-admin/firm/client/${id}`, {
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

export const updateClient = async (
  id: number,
  clientData: Partial<ClientPayload>, // we only update some fields
  file?: File // optional new profile image
): Promise<Client> => {
  try {
    if (IS_DEMO_MODE) {
      const existing = getDemoClientById(id);
      return demoDelay({
        ...existing,
        ...clientData,
        id,
        updatedAt: new Date().toISOString(),
      } as Client);
    }

    const formData = new FormData();

    // Append text fields if provided
    if (clientData.fullName) formData.append("fullName", clientData.fullName);
    if (clientData.email) formData.append("email", clientData.email);
    if (clientData.phone) formData.append("phone", clientData.phone);
    if (clientData.address) formData.append("address", clientData.address);
    if (clientData.clientType)
      formData.append("clientType", clientData.clientType);
    if (clientData.organization)
      formData.append("organization", clientData.organization);
    if (clientData.status) formData.append("status", clientData.status);
    if (clientData.billingAddress)
      formData.append("billingAddress", clientData.billingAddress);
    if (clientData.outstandingBalance !== undefined)
      formData.append(
        "outstandingBalance",
        clientData.outstandingBalance.toString()
      );
    if (clientData.gender) formData.append("gender", clientData.gender);
    if (clientData.dob) formData.append("dob", clientData.dob);
    if (clientData.firmId !== undefined)
      formData.append("firmId", clientData.firmId.toString());

    // Append file if provided
    if (file) {
      formData.append("profileImage", file);
    }

    const response = await axios.put(
      `${BASE_URL}/firm-admin/firm/client/${id}`,
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
    console.error("Error updating client:", error);
    throw error;
  }
};
export const deleteClient = async (id: number) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({ success: true, message: "Demo client deleted" });
    }

    const response = await axios.delete<{ message: string }>(
      `${BASE_URL}/firm-admin/firm/client/${id}`,
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
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        message: "Demo case created",
        case: {
          id: Date.now(),
          firmId,
          title: String(data.get("title") || "New Demo Case"),
          caseNumber: String(data.get("caseNumber") || "NLG-2026-DEMO"),
          status: String(data.get("status") || "Open"),
          openedAt: new Date().toISOString(),
        },
      });
    }

    const response = await axios.post(
      `${BASE_URL}/firm-admin/${firmId}/addCase`,
      data,
      {
        withCredentials: true,
      }
    );
    console.log("create case api response is", response);
    return response.data;
  } catch (error) {
    console.error("Error creating case:", error);
    throw new Error("Error creating case: " + error);
  }
};

export const getAllCasesOfFirm = async (firmId: number): Promise<Case[]> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoCasesByFirm(firmId || 101) as Case[]);
    }

    const response = await axios.get<{ cases: Case[] }>(
      `${BASE_URL}/firm-admin/firm/cases`,

      { params: { firmId }, withCredentials: true }
    );

    return response.data.cases;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of firm: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

export const getAllCasesOfLawyer = async (lawyerId?: number): Promise<Case[]> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoCasesByLawyer(lawyerId || 201) as Case[]);
    }

    const response = await axios.get<{ cases: Case[] }>(
      `${BASE_URL}/firm-admin/lawyer/cases`, // same as backend route
      { params: { lawyerId }, withCredentials: true }
    );

    return response.data.cases;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of lawyer: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching cases of lawyer");
  }
};

export const getAllCasesOfClient = async (
  clientId: number
): Promise<Case[]> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoCasesByClient(clientId || 301) as Case[]);
    }

    const response = await axios.get<{ success: boolean; cases: Case[] }>(
      `${BASE_URL}/firm-admin/clients/${clientId}/cases`,
      { withCredentials: true }
    );
    return response.data.cases;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching client cases: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching client cases");
  }
};

export const getAllClientsOfLawyer = async (): Promise<Client[]> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay(getDemoClientsByFirm(101) as Client[]);
    }

    const response = await axios.get(`${BASE_URL}/firm-admin/lawyer/clients`, {
      withCredentials: true,
    });
    return response.data.clients;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of lawyer: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching cases of lawyer");
  }
};

export const getCaseById = async (id: number) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        case: getDemoCaseById(id),
      });
    }

    const resposne = await axios.get(
      `${BASE_URL}/firm-admin/firm/cases/${id}`,
      { withCredentials: true }
    );
    return resposne.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of firm: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

export const deleteCaseByFirm = async (firmId: number, id: number) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({ success: true, message: "Demo case deleted", case: { id, firmId } });
    }

    const response = await axios.delete(
      `${BASE_URL}/firm-admin/firm/${firmId}/cases/${id}`,
      { withCredentials: true }
    );
    return response.data.case;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of firm: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

export const updateCaseByFirm = async (id: number, data: FormData) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        message: "Demo case updated",
        case: {
          ...getDemoCaseById(id),
          title: String(data.get("title") || getDemoCaseById(id)?.title || "Updated Demo Case"),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const resposne = await axios.put(
      `${BASE_URL}/firm-admin/firm/cases/${id}`,
      data,
      { withCredentials: true }
    );
    return resposne.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of firm: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

export const updateCaseStatus = async (
  firmId: number,
  id: number,
  status: string
) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        ...getDemoCaseById(id),
        status,
      });
    }

    const response = await axios.patch(
      `${BASE_URL}/firm-admin/firm/${firmId}/cases/${id}/status`,
      {
        status,
      },
      {
        withCredentials: true,
      }
    );
    return response.data.case;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of firm: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

/**
 * Role Permission APIs
 * 1=> Get Permissoins
 * 2=> Create Permission
 * 3=> Assign Role
 */

export const getPermissions = async () => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({ success: true, permissions: demoPermissionRecords });
    }

    const response = await axios.get(`${BASE_URL}/roles/get-permissions`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error in get permission API", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error fetching cases of firm: ${error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Unexpected error while fetching clients");
  }
};

export const createRole = async (roleData: CreateRolePayload) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        message: "Demo role created",
        role: {
          id: Date.now(),
          name: roleData.name,
          permissions: roleData.permissions,
        },
      });
    }

    const response = await axios.post(
      `${BASE_URL}/roles/create-role`,
      roleData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating role:", error);
  }
};

export const assignRole = async (formData: AssignRolePayload) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        message: "Demo role assigned",
        user: formData,
      });
    }

    const response = await axios.post(
      `${BASE_URL}/roles/assign-role`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const fetchRoles = async () => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({ success: true, roles: demoRoles });
    }

    const response = await axios.get(`${BASE_URL}/roles/get-roles`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error Fetching Roles", error);
    return [];
  }
};

export const fetchUsersWithRolesAndPermissions = async () => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        firm: getDemoFirmById(101),
        users: demoUsersWithRoles,
      });
    }

    const response = await axios.get(
      `${BASE_URL}/roles/get-users-with-role-and-permissions`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Users with Roles and Permissions:", error);
    return { success: false, firm: null, users: [] };
  }
};

export const deleteUserById = async (id: number) => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({ success: true, message: "Demo user deleted" });
    }

    const response = await axios.delete(`${BASE_URL}/roles/delete-user/${id}`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const fetchUserById = async (
  id: number
): Promise<GetUserByIdResponse> => {
  try {
    if (IS_DEMO_MODE) {
      const user = getDemoUserById(id);
      return demoDelay({
        success: !!user,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              firmId: user.firmId,
              role: {
                id: user.role.id,
                name: user.role.name,
                permissions: user.permissions,
              },
              status: user.status as "active" | "inactive",
            }
          : null,
      });
    }

    const response = await axios.get(`${BASE_URL}/roles/get-user/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return { success: false, user: null };
  }
};

export const updateUser = async (
  id: number,
  updateData: UpdateUserPayload
): Promise<UpdateUserResponse> => {
  try {
    if (IS_DEMO_MODE) {
      return demoDelay({
        success: true,
        message: "Demo user updated",
        user: {
          id,
          firmId: 101,
          status: updateData.status || "active",
          permissions: updateData.addPermissions || [],
        },
      });
    }

    const response = await axios.put<UpdateUserResponse>(
      `${BASE_URL}/roles/update-user/${id}`,
      updateData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: "Failed to update user",
    };
  }
};

export const lawyerStatsData = async () => {
  try {
    if (IS_DEMO_MODE) {
      const currentUser =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user") || "{}")
          : {};
      return demoDelay(buildLawyerStats(currentUser.id || 201));
    }

    const response = await axios.get(`${BASE_URL}/firm-admin/lawyers/stats`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log("Error Fetching Lawyers Stats", error);
  }
};

export const clientStatsData = async (): Promise<ClientStats | null> => {
  try {
    if (IS_DEMO_MODE) {
      const currentUser =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user") || "{}")
          : {};
      return demoDelay(buildClientStats(currentUser.id || 301) as ClientStats);
    }

    const response = await axios.get(`${BASE_URL}/firm-admin/client/stats`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Error Fetching Lawyers Stats", error);
    return null;
  }
};

export interface UploadCaseDocumentsResponse {
  success: boolean;
  message: string;
  documents: {
    id: number;
    fileName: string;
    fileType: string;
    filePath: string;
    uploadedById: number;
    uploadedByType: string;
    createdAt: string;
  }[];
}

export const getCaseDocuments = async (
  role: string,
  firmId: number,
  caseId: number
) => {
  if (IS_DEMO_MODE) {
    return demoDelay(getDemoDocumentsByCase(caseId));
  }

  let url = "";

  if (role === "Firm Admin" || role === "Super Admin") {
    url = `${BASE_URL}/firm-admin/firm/${firmId}/cases/${caseId}/documents`;
  } else if (role === "Lawyer") {
    url = `${BASE_URL}/firm-admin/lawyer/cases/${caseId}/documents`;
  } else if (role === "Client") {
    url = `${BASE_URL}/firm-admin/client/cases/${caseId}/documents`;
  }

  const response = await axios.get(url, { withCredentials: true });
  return response.data.documents;
};

export const uploadCaseDocuments = async (
  role: string,
  firmId: number,
  caseId: number,
  files: File[]
): Promise<UploadCaseDocumentsResponse> => {
  if (IS_DEMO_MODE) {
    return demoDelay({
      success: true,
      message: "Demo documents uploaded",
      documents: files.map((file, index) => ({
        id: Date.now() + index,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        filePath: `demo-documents/${file.name}`,
        uploadedById: 1,
        uploadedByType: role,
        createdAt: new Date().toISOString(),
      })),
    });
  }

  const form = new FormData();
  files.forEach((file) => form.append("documents", file));

  let url = "";

  if (role === "Firm Admin" || role === "Super Admin") {
    url = `${BASE_URL}/firm-admin/firm/${firmId}/cases/${caseId}/documents`;
  } else if (role === "Lawyer") {
    url = `${BASE_URL}/firm-admin/lawyer/cases/${caseId}/documents`;
  } else if (role === "Client") {
    url = `${BASE_URL}/firm-admin/client/cases/${caseId}/documents`;
  }

  const response = await axios.post(url, form, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data as UploadCaseDocumentsResponse;
};

export const deleteCaseDocument = async (
  firmId: number,
  caseId: number,
  docId: number
) => {
  if (IS_DEMO_MODE) {
    return demoDelay({ success: true, message: "Demo document deleted" });
  }

  const response = await axios.delete(
    `${BASE_URL}/firm-admin/firm/${firmId}/cases/${caseId}/documents/${docId}`,
    { withCredentials: true }
  );
  return response.data as { success: boolean; message: string };
};
