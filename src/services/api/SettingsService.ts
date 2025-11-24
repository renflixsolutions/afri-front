import apiService from './ApiService';
import type {
  Setting,
  BulkFeeSettingRequest,
} from '@/types/settings';

export class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * List all settings, optionally filtered by prefix
   * @param prefix Optional prefix filter (e.g., 'fee.' or 'payments.')
   */
  async getSettings(prefix?: string): Promise<Setting[]> {
    const params = new URLSearchParams();
    if (prefix) {
      params.append('prefix', prefix);
    }

    const url = params.toString() ? `settings?${params.toString()}` : 'settings';
    const response = await apiService.get<{ data: Setting[] }>(url);

    return (response.data as any).data || [];
  }

  /**
   * Get a single setting by key
   * @param key The setting key (e.g., 'payments.default_gateway')
   */
  async getSetting(key: string): Promise<Setting> {
    const response = await apiService.get<{ data: Setting }>(`settings/${key}`);

    return (response.data as any).data;
  }

  /**
   * Create or update a single setting
   * @param key The setting key
   * @param data The setting value and optional type
   */
  async updateSetting(key: string, data: { value: unknown; type?: 'json' | 'string' | null }): Promise<Setting> {
    const response = await apiService.put<{ data: Setting }>(`settings/${key}`, data);

    return (response.data as any).data;
  }

  /**
   * Delete a setting
   * @param key The setting key to delete
   */
  async deleteSetting(key: string): Promise<boolean> {
    const response = await apiService.delete<{ deleted: boolean }>(`settings/${key}`);

    return (response.data as any).deleted || false;
  }

  /**
   * Bulk upsert fee amount and currency for a module
   * @param data Module, amount, and currency
   */
  async bulkSetFee(data: BulkFeeSettingRequest): Promise<Setting[]> {
    const response = await apiService.put<{ data: Setting[] }>('settings/fee', data);

    return (response.data as any).data || [];
  }

  // Convenience methods for common operations

  /**
   * Get all payment settings
   */
  async getPaymentSettings(): Promise<Setting[]> {
    return this.getSettings('payments.');
  }

  /**
   * Get all fee settings
   */
  async getFeeSettings(): Promise<Setting[]> {
    return this.getSettings('fee.');
  }

  /**
   * Get the default payment gateway
   */
  async getDefaultGateway(): Promise<string> {
    const setting = await this.getSetting('payments.default_gateway');
    return setting.value as string;
  }

  /**
   * Set the default payment gateway
   * @param gateway The gateway to set (e.g., 'mpesa')
   */
  async setDefaultGateway(gateway: string): Promise<Setting> {
    return this.updateSetting('payments.default_gateway', { value: gateway });
  }

  /**
   * Get supported payment gateways
   */
  async getSupportedGateways(): Promise<string[]> {
    try {
      const setting = await this.getSetting('payments.supported_gateways');
      return Array.isArray(setting.value) ? setting.value as string[] : [setting.value as string];
    } catch (error) {
      // Return default if not set
      return ['mpesa'];
    }
  }

  /**
   * Set supported payment gateways
   * @param gateways Array of supported gateways
   */
  async setSupportedGateways(gateways: string[]): Promise<Setting> {
    return this.updateSetting('payments.supported_gateways', {
      value: gateways,
      type: 'json'
    });
  }

  /**
   * Get fee for a specific module
   * @param module The module name (e.g., 'job', 'course')
   */
  async getModuleFee(module: string): Promise<{ amount: string; currency: string; type: string; percentage: string }> {
    const [amountSetting, currencySetting, typeSetting, percentageSetting] = await Promise.all([
      this.getSetting(`fee.${module}.amount`),
      this.getSetting(`fee.${module}.currency`),
      this.getSetting(`fee.${module}.type`),
      this.getSetting(`fee.${module}.percentage`),
    ]);

    return {
      amount: amountSetting.value as string,
      currency: currencySetting.value as string,
      type: typeSetting.value as string,
      percentage: percentageSetting.value as string,
    };
  }

  /**
   * Set fee for a specific module
   * @param module The module name
   * @param amount The fee amount
   * @param currency The currency code
   * @param type The fee type ('fixed' or 'percentage')
   * @param percentage The percentage value (if type is 'percentage')
   */
  async setModuleFee(module: string, amount: number | string, currency: string, type: string, percentage: number | string): Promise<Setting[]> {
    return this.bulkSetFee({ module, amount, currency, type, percentage });
  }

  /**
   * Delete fee settings for a module
   * @param module The module name
   */
  async deleteModuleFee(module: string): Promise<void> {
    await Promise.all([
      this.deleteSetting(`fee.${module}.amount`),
      this.deleteSetting(`fee.${module}.currency`),
      this.deleteSetting(`fee.${module}.type`),
      this.deleteSetting(`fee.${module}.percentage`),
    ]);
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();

