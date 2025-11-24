import { PaginatedResponse } from './regions';

export interface Device {
  id: string;
  country_id: string;
  country_name?: string;
  serial_number: string;
  imei: string;
  model: string;
  os: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  last_log_at?: string | null;
}

export interface DeviceLog {
  id: string;
  ip_address: string;
  latitude: string | null;
  longitude: string | null;
  staff_name: string;
  created_at: string | null;
}

export type DeviceResponse = PaginatedResponse<Device>;
