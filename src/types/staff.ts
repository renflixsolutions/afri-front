import { PaginatedResponse } from '@/types/regions';

export interface StaffRole {
  id: string;
  name: string;
}

export interface StaffDevice {
  id: string | null;
  model: string | null;
  serial_number: string | null;
}

export interface StaffSubLocation {
  id: string;
  name: string;
}

export interface StaffLocation {
  id: string;
  name: string;
  sub_location: StaffSubLocation;
}

export interface StaffCountry {
  id: string;
  name: string;
  location: StaffLocation;
}

export interface Staff {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: StaffRole;
  country: StaffCountry;
  location: string;
  sub_location: string;
  account_locked: boolean;
  inactive: boolean;
  device: StaffDevice | null;
}

export interface StaffResponse {
  status: boolean;
  message: string;
  data: PaginatedResponse<Staff>;
}

export interface StaffAuditTrail {
  id: string;
  type: string;
  channel: string;
  description: string;
  ip_address: string;
  created_at: string;
}
