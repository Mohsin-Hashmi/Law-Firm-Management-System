export interface ClientPayload {
  fullName: string;
  dob?: string; // YYYY-MM-DD
  gender?: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  address?: string;
  clientType?: "Individual" | "Business" | "Corporate";
  organization?: string;
  status?: "Active" | "Past" | "Potential" | "Suspended";
  billingAddress?: string;
  outstandingBalance?: number;
  firmId: number; // required since Client belongs to Firm
}

export interface Client extends ClientPayload {
  id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}