import { Lawyer } from "../types/lawyer";
export interface ClientPayload {
  fullName: string;
  dob?: string; // YYYY-MM-DD
  gender?: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  address?: string;
  clientType: "Individual" | "Business" | "Corporate";
  organization?: string;
  status: "Active" | "Past" | "Potential" | "Suspended";
  billingAddress?: string;
  outstandingBalance?: number;
  casesCount?: number;
  firmId: number; // required since Client belongs to Firm
}

export interface Client extends ClientPayload {
  id: number;
  client: Client;
  profileImage?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CaseStats {
  open: number;
  closed: number;
  onHold: number;
  appeal: number;
}

export interface ClientStats {
  clientId: number;
  clientName: string;
  totalCases: number;
  activeCases: number;
  completedCases: number;
  uploadedDocuments: number;
}
