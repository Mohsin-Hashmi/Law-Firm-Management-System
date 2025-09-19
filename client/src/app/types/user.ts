
import { Role } from "./role";
export interface User {
  id: number;
  name: string;
  email: string;
  firmId: number;
  role: Role | null;
  status: string;
}

export interface UpdateUserPayload {
  status?: "active" | "inactive";
  roleId?: number;
  addPermissions?: string[];
  removePermissions?: string[];
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    firmId: number;
    role?: { id: number; name: string } | null;
    status: "active" | "inactive";
    permissions?: string[];
  };
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  firmId: number;
  role: {
    id: number;
    name: string;
    permissions: string[];
  } | null;
  status: "active" | "inactive";
}

export interface GetUserByIdResponse {
  success: boolean;
  user: UserDetail | null;
}
