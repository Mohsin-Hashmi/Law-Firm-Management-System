export interface FirmPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscription_plan: "Free" | "Basic" | "Premium";
  max_users: number;
  max_cases: number;
  status: "Active" | "Suspended" | "Cancelled";
  billing_info?: {
    card_number: string;
    expiry: string; // e.g., "MM/YY"
    billing_address: string;
  };
  trial_ends_at?: string;
}
