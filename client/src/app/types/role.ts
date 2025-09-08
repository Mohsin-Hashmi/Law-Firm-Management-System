export interface CreateRolePayload {
  name: string;
  permissions: string[];
}

export interface AssignRolePayload{
  name: string,
  email: string,
  roleId: number
}