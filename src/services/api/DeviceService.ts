import apiService from './ApiService';
import { DeviceResponse, Device, DeviceLog } from '../../types/devices';
import { PaginatedResponse } from '../../types/regions';

class DeviceService {
  async getDevices(page: number = 1): Promise<PaginatedResponse<Device>> {
    const response = await apiService.get<PaginatedResponse<Device>>(`devices/list?page=${page}`);
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load devices');
    }
  }

  async addDevice(deviceData: {
    country_id: string;
    serial_number: string;
    imei: string;
    model: string;
    os: string;
    location: string;
  }) {
    const response = await apiService.post('devices/add', deviceData);
    
    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add device');
    }
  }

  async updateDevice(id: string, deviceData: {
    country_id: string;
    imei: string;
    model: string;
    os: string;
    location: string;
    status: string;
  }) {
    const response = await apiService.put(`devices/update/${id}`, deviceData);
    
    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to update device');
    }
  }

  async deleteDevice(id: string) {
    const response = await apiService.delete(`devices/delete/${id}`);
    
    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete device');
    }
  }

  async getDeviceLogs(deviceId: string, page: number = 1, search?: string, dateFrom?: string, dateTo?: string): Promise<PaginatedResponse<DeviceLog>> {
    let url = `devices/logs/${deviceId}?page=${page}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (dateFrom) {
      url += `&date_from=${dateFrom}`;
    }
    if (dateTo) {
      url += `&date_to=${dateTo}`;
    }

    const response = await apiService.get<PaginatedResponse<DeviceLog>>(url);

    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load device logs');
    }
  }

  async getActiveDevices(page: number = 1, search?: string): Promise<PaginatedResponse<Device>> {
    let url = `devices/active?page=${page}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await apiService.get<PaginatedResponse<Device>>(url);

    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load active devices');
    }
  }
}

export default new DeviceService();
