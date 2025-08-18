export interface FirmPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscription_plan: "Free" | "Basic" | "Premium";
  max_users: number;
  max_cases: number;
  status?: "Active" | "Suspended" | "Cancelled";
}


export interface LawyerPayload {
  name: string;
  email: string;
  phone: string;
  specialization?: string;  // optional
  status?: "Active" | "Inactive"; // default "Active"
}

export interface FirmStats {
  firmId: number;
  firmName: string;
  lawyersCount: number;
  clientsCount: number;
  casesCount?: number;
  totalUsersCount: number;
  activeLawyersCount: number;
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
}