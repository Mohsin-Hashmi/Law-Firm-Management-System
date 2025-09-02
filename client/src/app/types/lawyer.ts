
// src/types/lawyer.ts

export interface Lawyer {
  id: number;
  firmId: number; 
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  status: "Active" | "Inactive"; 
  profileImage?: string | null; 
  createdAt: string; 
  updatedAt: string;
}

export interface LawyerPerformance {
  lawyerId: string;
  name: string;
  totalCases: number;
  completedCases: number;
  activeCases: number;
  wonCases: number;
  lostCases: number;
  successRate: number;
}