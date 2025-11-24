import { PaginatedResponse } from '@/types/regions';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  role_id?: number;
  country: { id: string; name: string }[];
  location: string;
  sub_location: string;
  created_at: string;
  inactive?: boolean;
  account_locked?: boolean;
  address?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UserResponse {
  status: boolean;
  message: string;
  data: PaginatedResponse<User>;
}

export interface CreateUserData {
  full_name: string;
  username: string;
  email?: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  country_ids?: string[];
  role_id: number;
}

export interface UserRole {
  id: number;
  name: string;
  description?: string;
}

export interface AuditTrail {
  id: string;
  type: string;
  entity_id: number;
  channel: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface AuditTrailResponse {
  status: boolean;
  message: string;
  data: PaginatedResponse<AuditTrail>;
}
