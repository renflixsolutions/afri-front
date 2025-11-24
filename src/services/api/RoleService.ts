import apiService from './ApiService';

export interface Permission {
  code: number;
  name: string;
}

export interface RolePermission extends Permission {
  checked: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: RolePermission[];
}

export interface RolesResponse {
  status: boolean;
  message: string;
  data: Role[];
}

export interface PermissionsResponse {
  status: boolean;
  message: string;
  data: Record<string, Permission[]>;
}

export const roleService = {
  getUserRoles: async (): Promise<Role[]> => {
    const response = await apiService.get<RolesResponse>('user-roles');
    return response.data.data;
  },



  getUserPermissions: async (): Promise<Record<string, Permission[]>> => {
    const response = await apiService.get<PermissionsResponse>('user-roles/permissions');
    return response.data.data;
  },


  updateUserRole: async (roleId: string, data: { name: string; permissions: string[] }): Promise<{ status: boolean; message: string }> => {
    const response = await apiService.put(`user-roles/${roleId}`, data);
    return response.data;
  },


  createUserRole: async (data: { name: string; permissions: string[] }): Promise<{ status: boolean; message: string }> => {
    const response = await apiService.post('user-roles', data);
    return response.data;
  },


  deleteUserRole: async (roleId: string): Promise<{ status: boolean; message: string }> => {
    const response = await apiService.delete(`user-roles/${roleId}`);
    return response.data;
  },

};
