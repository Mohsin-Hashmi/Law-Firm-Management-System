
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
