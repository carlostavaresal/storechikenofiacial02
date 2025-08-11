
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySettings {
  id: string;
  whatsapp_number: string;
  company_name?: string | null;
  company_address?: string | null;
  delivery_fee?: number | null;
  minimum_order?: number | null;
  pix_email?: string | null;
  pix_enabled?: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, clearing settings');
        setSettings(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company settings:', error);
        setError(error.message);
        setSettings(null);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      setError('Erro ao carregar configurações');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return false;
      }

      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('company_settings')
          .update(newSettings)
          .eq('id', settings.id);

        if (error) {
          console.error('Error updating company settings:', error);
          setError(error.message);
          return false;
        }
      } else {
        // Create new settings
        if (!newSettings.whatsapp_number) {
          setError('Número do WhatsApp é obrigatório');
          return false;
        }

        const { error } = await supabase
          .from('company_settings')
          .insert([{
            whatsapp_number: newSettings.whatsapp_number,
            company_name: newSettings.company_name,
            company_address: newSettings.company_address,
            delivery_fee: newSettings.delivery_fee,
            minimum_order: newSettings.minimum_order,
            pix_email: newSettings.pix_email,
            pix_enabled: newSettings.pix_enabled || false
          }]);

        if (error) {
          console.error('Error creating company settings:', error);
          setError(error.message);
          return false;
        }
      }

      // Refresh settings after update
      await fetchSettings();
      return true;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      setError('Erro ao salvar configurações');
      return false;
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
