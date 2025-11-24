// Settings API Types

export interface Setting {
  id?: string;
  key: string;
  value: string | number | object | unknown[]; // Raw string or decoded JSON
  type: 'json' | null;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsListResponse {
  data: Setting[];
}

export interface SettingResponse {
  data: Setting;
}

export interface CreateUpdateSettingRequest {
  value: string | number | object | unknown[]; // Can be string, number, object, array
  type?: 'json' | 'string' | null;
}

export interface BulkFeeSettingRequest {
  module: string;
  amount: number | string;
  currency: string;
  type: 'fixed' | 'percentage';
  percentage: number | string;
}

export interface BulkFeeSettingResponse {
  data: Setting[];
}

export interface DeleteSettingResponse {
  deleted: boolean;
}

// Validation error structure
export interface ValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

// Specific setting value types
export type PaymentGateway = 'mpesa';

export interface PaymentSettings {
  default_gateway: PaymentGateway;
  supported_gateways: PaymentGateway[];
}

export interface FeeSettings {
  amount: string; // Decimal string with 2 decimal places
  currency: string; // Uppercase ISO currency code
  type: 'fixed' | 'percentage';
  percentage: string;
}

// Helper type for fee modules
export type FeeModule = 'job' | 'scholarship' | 'language_course' | string;

// Namespace constants
export const ALLOWED_NAMESPACES = {
  PAYMENTS: 'payments.',
  FEE: 'fee.',
} as const;

export const PAYMENT_GATEWAYS = ['mpesa'] as const;

