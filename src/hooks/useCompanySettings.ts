
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

  // Função para carregar do localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('companySettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        console.log('Configurações carregadas do localStorage:', parsedSettings);
        return parsedSettings;
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
    return null;
  };

  // Função para salvar no localStorage
  const saveToLocalStorage = (data: CompanySettings) => {
    try {
      localStorage.setItem('companySettings', JSON.stringify(data));
      console.log('Configurações salvas no localStorage:', data);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro tenta carregar do localStorage
      const localSettings = loadFromLocalStorage();
      if (localSettings) {
        setSettings(localSettings);
      }

      // Verifica autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado, usando dados locais');
        setLoading(false);
        return;
      }

      // Tenta buscar do Supabase se autenticado
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar configurações do Supabase:', error);
        setError(error.message);
        // Mantém dados locais em caso de erro
      } else if (data) {
        setSettings(data);
        // Sincroniza com localStorage
        saveToLocalStorage(data);
      }
    } catch (error) {
      console.error('Erro em fetchSettings:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      console.log('Tentando salvar configurações:', newSettings);

      // Criar objeto atualizado
      const updatedSettings = {
        id: settings?.id || 'local-settings',
        whatsapp_number: newSettings.whatsapp_number || settings?.whatsapp_number || '',
        company_name: newSettings.company_name ?? settings?.company_name,
        company_address: newSettings.company_address ?? settings?.company_address,
        delivery_fee: newSettings.delivery_fee ?? settings?.delivery_fee,
        minimum_order: newSettings.minimum_order ?? settings?.minimum_order,
        pix_email: newSettings.pix_email ?? settings?.pix_email,
        pix_enabled: newSettings.pix_enabled ?? settings?.pix_enabled ?? false,
        created_at: settings?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Sempre salva no localStorage primeiro
      saveToLocalStorage(updatedSettings);
      setSettings(updatedSettings);

      // Verifica autenticação para tentar salvar no Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Configurações salvas apenas localmente (usuário não autenticado)');
        return true;
      }

      // Tenta salvar no Supabase se autenticado
      if (settings?.id && settings.id !== 'local-settings') {
        // Atualizar registro existente
        const { error } = await supabase
          .from('company_settings')
          .update({
            whatsapp_number: updatedSettings.whatsapp_number,
            company_name: updatedSettings.company_name,
            company_address: updatedSettings.company_address,
            delivery_fee: updatedSettings.delivery_fee,
            minimum_order: updatedSettings.minimum_order,
            pix_email: updatedSettings.pix_email,
            pix_enabled: updatedSettings.pix_enabled,
            updated_at: updatedSettings.updated_at
          })
          .eq('id', settings.id);

        if (error) {
          console.error('Erro ao atualizar no Supabase:', error);
          setError(`Erro no banco: ${error.message}`);
          // Mas mantém dados locais
          return true;
        }
        console.log('Configurações atualizadas no Supabase');
      } else {
        // Criar novo registro
        if (!updatedSettings.whatsapp_number) {
          setError('Número do WhatsApp é obrigatório');
          return false;
        }

        const { data, error } = await supabase
          .from('company_settings')
          .insert([{
            whatsapp_number: updatedSettings.whatsapp_number,
            company_name: updatedSettings.company_name,
            company_address: updatedSettings.company_address,
            delivery_fee: updatedSettings.delivery_fee,
            minimum_order: updatedSettings.minimum_order,
            pix_email: updatedSettings.pix_email,
            pix_enabled: updatedSettings.pix_enabled
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar no Supabase:', error);
          setError(`Erro no banco: ${error.message}`);
          // Mas mantém dados locais
          return true;
        }

        if (data) {
          const finalSettings = { ...updatedSettings, id: data.id };
          setSettings(finalSettings);
          saveToLocalStorage(finalSettings);
          console.log('Novo registro criado no Supabase');
        }
      }

      return true;
    } catch (error) {
      console.error('Erro em updateSettings:', error);
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
