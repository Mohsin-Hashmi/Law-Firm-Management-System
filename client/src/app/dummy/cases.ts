import { demoClients } from "./clients";
import { demoLawyers } from "./lawyers";

const clientRef = (id: number) => {
  const client = demoClients.find((item) => item.id === id)!;
  return {
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    profileImage: client.profileImage,
    clientType: client.clientType,
  };
};

const lawyerRef = (id: number) => {
  const lawyer = demoLawyers.find((item) => item.id === id)!;
  return {
    id: lawyer.id,
    name: lawyer.name,
    email: lawyer.email,
    phone: lawyer.phone,
    specialization: lawyer.specialization,
    profileImage: lawyer.profileImage,
  };
};

export const demoCases = [
  {
    id: 401,
    firmId: 101,
    title: "Harper Estate Settlement",
    caseNumber: "NLG-2026-001",
    caseType: "Family",
    status: "Open" as const,
    openedAt: "2026-01-14T10:00:00.000Z",
    closedAt: null,
    description: "Probate coordination and estate distribution for a family trust.",
    client: clientRef(301),
    lawyers: [lawyerRef(202), lawyerRef(206)],
    documents: [],
  },
  {
    id: 402,
    firmId: 101,
    title: "Bennett Studio Vendor Dispute",
    caseNumber: "NLG-2026-002",
    caseType: "Corporate",
    status: "On Hold" as const,
    openedAt: "2026-02-02T10:00:00.000Z",
    closedAt: null,
    description: "Contract dispute involving delayed product delivery and payment terms.",
    client: clientRef(302),
    lawyers: [lawyerRef(201), lawyerRef(204)],
    documents: [],
  },
  {
    id: 403,
    firmId: 101,
    title: "Mercer Employment Review",
    caseNumber: "NLG-2026-003",
    caseType: "Civil",
    status: "Open" as const,
    openedAt: "2026-03-11T10:00:00.000Z",
    closedAt: null,
    description: "Internal employment policy review and executive severance guidance.",
    client: clientRef(304),
    lawyers: [lawyerRef(204)],
    documents: [],
  },
  {
    id: 404,
    firmId: 101,
    title: "Lancaster Lease Negotiation",
    caseNumber: "NLG-2026-004",
    caseType: "Real Estate",
    status: "Closed" as const,
    openedAt: "2025-12-19T10:00:00.000Z",
    closedAt: "2026-05-21T10:00:00.000Z",
    description: "Commercial lease amendment and landlord negotiation.",
    client: clientRef(306),
    lawyers: [lawyerRef(205), lawyerRef(201)],
    documents: [],
  },
  {
    id: 405,
    firmId: 101,
    title: "Coleman Tenant Claim",
    caseNumber: "NLG-2026-005",
    caseType: "Civil",
    status: "Appeal" as const,
    openedAt: "2026-04-07T10:00:00.000Z",
    closedAt: null,
    description: "Tenant rights claim after disputed security deposit withholding.",
    client: clientRef(303),
    lawyers: [lawyerRef(203)],
    documents: [],
  },
  {
    id: 406,
    firmId: 101,
    title: "Patel Immigration Filing",
    caseNumber: "NLG-2026-006",
    caseType: "Immigration",
    status: "Closed" as const,
    openedAt: "2025-10-10T10:00:00.000Z",
    closedAt: "2026-02-14T10:00:00.000Z",
    description: "Employment-based immigration filing and document review.",
    client: clientRef(305),
    lawyers: [lawyerRef(206)],
    documents: [],
  },
  {
    id: 407,
    firmId: 101,
    title: "Mercer Supplier Agreement",
    caseNumber: "NLG-2026-007",
    caseType: "Corporate",
    status: "Open" as const,
    openedAt: "2026-06-03T10:00:00.000Z",
    closedAt: null,
    description: "Master supply agreement revision for regional food distributor.",
    client: clientRef(304),
    lawyers: [lawyerRef(201)],
    documents: [],
  },
];

export const getDemoCasesByFirm = (firmId = 101) =>
  demoCases.filter((caseItem) => caseItem.firmId === Number(firmId));

export const getDemoCaseById = (id: number | string) =>
  demoCases.find((caseItem) => caseItem.id === Number(id)) || null;

export const getDemoCasesByLawyer = (lawyerId: number | string) =>
  demoCases.filter((caseItem) =>
    caseItem.lawyers.some((lawyer) => lawyer.id === Number(lawyerId))
  );

export const getDemoCasesByClient = (clientId: number | string) =>
  demoCases.filter((caseItem) => caseItem.client.id === Number(clientId));
