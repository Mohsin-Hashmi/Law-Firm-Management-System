import { getDemoCasesByClient, getDemoCasesByFirm, getDemoCasesByLawyer } from "./cases";
import { getDemoClientsByFirm } from "./clients";
import { getDemoFirmById, demoFirms } from "./firms";
import { getDemoLawyerById, getDemoLawyersByFirm } from "./lawyers";

export const demoDelay = <T>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });

export const demoAxiosResponse = <T>(data: T) =>
  demoDelay({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  });

export const buildFirmStats = (firmId = 101) => {
  const firm = getDemoFirmById(firmId);
  const lawyers = getDemoLawyersByFirm(firm.id);
  const clients = getDemoClientsByFirm(firm.id);
  const cases = getDemoCasesByFirm(firm.id);
  const activeLawyers = lawyers.filter((lawyer) => lawyer.status === "Active");

  return {
    ...firm,
    firmId: firm.id,
    firmName: firm.name,
    lawyersCount: lawyers.length,
    clientsCount: clients.length,
    casesCount: cases.length,
    totalUsersCount: lawyers.length + clients.length + 1,
    activeLawyersCount: activeLawyers.length,
    stats: {
      totalUsers: lawyers.length + clients.length + 1,
      activeUsers: activeLawyers.length + clients.filter((client) => client.status === "Active").length + 1,
      inactiveUsers: lawyers.length - activeLawyers.length,
    },
  };
};

export const buildLawyerStats = (lawyerId = 201) => {
  const lawyer = getDemoLawyerById(lawyerId) || getDemoLawyersByFirm(101)[0];
  const cases = getDemoCasesByLawyer(lawyer.id);
  const clients = new Set(cases.map((caseItem) => caseItem.client.id));

  return {
    lawyerName: lawyer.name,
    stats: {
      lawyerName: lawyer.name,
      completedCases: cases.filter((caseItem) => caseItem.status === "Closed").length,
      ongoingCases: cases.filter((caseItem) => caseItem.status === "Open").length,
      pendingCases: cases.filter((caseItem) => caseItem.status === "On Hold" || caseItem.status === "Appeal").length,
      activeClients: clients.size,
    },
  };
};

export const buildClientStats = (clientId = 301) => {
  const cases = getDemoCasesByClient(clientId);
  const activeCases = cases.filter((caseItem) => caseItem.status === "Open" || caseItem.status === "On Hold");
  const completedCases = cases.filter((caseItem) => caseItem.status === "Closed");
  const lawyers = cases.flatMap((caseItem) => caseItem.lawyers);
  const uniqueLawyers = Array.from(new Map(lawyers.map((lawyer) => [lawyer.id, lawyer])).values());
  const clientName = cases[0]?.client.fullName || "Olivia Harper";
  const clientEmail = cases[0]?.client.email || "olivia.harper@example.demo";

  return {
    clientId,
    clientName,
    clientEmail,
    totalCases: cases.length,
    activeCases: activeCases.length,
    completedCases: completedCases.length,
    uploadedDocuments: 3,
    totalLawyersAssigned: uniqueLawyers.length,
    caseStats: {
      openCases: cases.filter((caseItem) => caseItem.status === "Open").length,
      closedCases: completedCases.length,
      wonCases: 1,
      onHold: cases.filter((caseItem) => caseItem.status === "On Hold").length,
      appeal: cases.filter((caseItem) => caseItem.status === "Appeal").length,
    },
    lawyers: uniqueLawyers,
  };
};

export const buildPlatformOverview = () => {
  const firms = demoFirms;
  const firmStats = firms.map((firm) => buildFirmStats(firm.id));

  return {
    successRate: 92.6,
    clientSatisfaction: 96.1,
    monthlyRevenue: 18500,
    monthlyGrowth: 14.2,
    totalFirms: firms.length,
    totalLawyers: firmStats.reduce((sum, firm) => sum + firm.lawyersCount, 0),
    totalClients: firmStats.reduce((sum, firm) => sum + firm.clientsCount, 0),
    totalCases: firmStats.reduce((sum, firm) => sum + (firm.casesCount || 0), 0),
  };
};
