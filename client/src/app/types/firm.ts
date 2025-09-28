export interface FirmPayload {
  id?: number; 
  name: string;
  email?: string; 
  phone?: string;
  address?: string;
  subscription_plan: "Free" | "Basic" | "Premium";
  max_users?: number;
  max_cases?: number;
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
  status: string;
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
  subscription_plan: "Free" | "Basic" | "Premium";
  phone?: string;
}

export interface Lawyer {
  id: number;
  firmId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: string;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
  casesCount?: number;
  clientsCount?:number;
}

export interface SubscriptionPayload {
  plan: string;       
  duration: number;    
  limits?: {
    maxLawyers?: number;
    maxClients?: number;
    maxCases?: number;
  };
  status?: "Active" | "Cancelled" | "Expired";
}