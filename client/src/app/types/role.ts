import { Permission } from "./permission";
export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}
export interface CreateRolePayload {
  name: string;
  permissions: string[];
}

export interface AssignRolePayload{
  name: string,
  email: string,
  roleId: number
}