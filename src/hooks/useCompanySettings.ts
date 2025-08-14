
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySettings {
  id?: string;
  company_name?: string;
  company_address?: string;
  whatsapp_number?: string;
  delivery_fee?: number;
  minimum_order?: number;
  pix_enabled?: boolean;
  pix_email?: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem("companySettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded company settings from localStorage:', parsedSettings);
        setSettings(parsedSettings);
        return parsedSettings;
      }
    } catch (error) {
      console.error('Error loading company settings from localStorage:', error);
      setError('Erro ao carregar configurações');
    }
    return null;
  };

  const saveToLocalStorage = (newSettings: CompanySettings) => {
    try {
      localStorage.setItem("companySettings", JSON.stringify(newSettings));
      console.log('Company settings saved to localStorage:', newSettings);
    } catch (error) {
      console.error('Error saving company settings to localStorage:', error);
      setError('Erro ao salvar configurações');
    }
  };

  const fetchSettings = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        console.log('Loaded company settings from Supabase:', data);
        setSettings(data);
        saveToLocalStorage(data);
      } else {
        // No data in Supabase, try localStorage
        const localSettings = loadFromLocalStorage();
        if (!localSettings) {
          // Create default settings
          const defaultSettings: CompanySettings = {
            company_name: '',
            company_address: '',
            whatsapp_number: '',
            delivery_fee: 0,
            minimum_order: 0,
            pix_enabled: false,
            pix_email: ''
          };
          setSettings(defaultSettings);
          saveToLocalStorage(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      setError(error instanceof Error ? error.message : 'Error fetching settings');
      
      // Fallback to localStorage
      const localSettings = loadFromLocalStorage();
      if (!localSettings) {
        const defaultSettings: CompanySettings = {
          company_name: '',
          company_address: '',
          whatsapp_number: '',
          delivery_fee: 0,
          minimum_order: 0,
          pix_enabled: false,
          pix_email: ''
        };
        setSettings(defaultSettings);
        saveToLocalStorage(defaultSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      setError(null);
      console.log('Updating company settings:', newSettings);

      // Always save to localStorage first
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      saveToLocalStorage(updatedSettings);

      // Try to save to Supabase
      let result;
      if (settings?.id) {
        // Update existing
        result = await supabase
          .from('company_settings')
          .update(newSettings)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Insert new
        result = await supabase
          .from('company_settings')
          .insert([newSettings])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Supabase error, but data saved locally:', result.error);
        // Don't throw error, just log it since localStorage worked
      } else if (result.data) {
        console.log('Settings saved to Supabase successfully:', result.data);
        setSettings(result.data);
        saveToLocalStorage(result.data);
      }

      return true;
    } catch (error) {
      console.error('Error updating company settings:', error);
      // Settings are still saved locally, so don't fail completely
      console.log('Settings saved locally despite Supabase error');
      return true; // Return true because localStorage save succeeded
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};
