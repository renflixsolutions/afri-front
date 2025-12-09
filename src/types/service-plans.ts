// Service Plans Types

export type ServicePlanModule = 'job' | 'scholarship' | 'opportunity_request';
export type ServicePlanTier = 'standard' | 'premium' | 'enterprise';

export interface ServicePlan {
  id: string;
  module: ServicePlanModule;
  tier: ServicePlanTier;
  name: string;
  price: number;
  currency: string;
  formatted_price: string;
  features: string[];
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePlanFormData {
  module: ServicePlanModule;
  tier: ServicePlanTier;
  name: string;
  price: number;
  currency: string;
  features: string[];
  description: string;
  is_active: boolean;
}

export interface ServicePlanStatistics {
  total_plans: number;
  active_plans: number;
  inactive_plans: number;
  by_module: Record<string, number>;
  by_tier: Record<string, number>;
}

export interface ServicePlansResponse {
  success: boolean;
  message: string;
  data: ServicePlan[];
}

export interface ServicePlanResponse {
  success: boolean;
  message: string;
  data: ServicePlan;
}

export interface ServicePlanStatisticsResponse {
  success: boolean;
  message: string;
  data: ServicePlanStatistics;
}

export interface DeleteServicePlanResponse {
  success: boolean;
  message: string;
  data: [];
}

