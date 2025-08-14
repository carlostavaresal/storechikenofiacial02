
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeliverySettings {
  radius: string;
  fee: string;
  estimatedTime: string;
  preparationTime: string;
  deliveryTime: string;
  lastUpdated?: string;
}

export const useDeliverySettings = () => {
  const [settings, setSettings] = useState<DeliverySettings>({
    radius: "5",
    fee: "5.00",
    estimatedTime: "30-45",
    preparationTime: "25-35",
    deliveryTime: "15-20"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      return !!user;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem("deliverySettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded delivery settings from localStorage:', parsedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        return true;
      }
    } catch (error) {
      console.error('Error loading delivery settings from localStorage:', error);
    }
    return false;
  };

  const saveToLocalStorage = (settingsData: DeliverySettings) => {
    try {
      localStorage.setItem("deliverySettings", JSON.stringify(settingsData));
      console.log('Delivery settings saved to localStorage:', settingsData);
    } catch (error) {
      console.error('Error saving delivery settings to localStorage:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Fetching delivery settings...');
      
      const isAuth = await checkAuth();
      
      if (isAuth) {
        console.log('User authenticated, checking Supabase for delivery settings...');
        const { data, error } = await supabase
          .from('company_settings')
          .select('delivery_fee')
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase error:', error);
          throw error;
        }
        
        if (data && data.delivery_fee !== null) {
          console.log('Delivery fee found in Supabase:', data.delivery_fee);
          setSettings(prev => ({
            ...prev,
            fee: data.delivery_fee.toString()
          }));
        }
      }
      
      // Always load from localStorage as well (it may have more complete data)
      loadFromLocalStorage();
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      setError(error instanceof Error ? error.message : 'Error fetching delivery settings');
      
      // Fallback to localStorage
      console.log('Falling back to localStorage for delivery settings...');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<DeliverySettings>) => {
    try {
      setError(null);
      console.log('Updating delivery settings:', newSettings);
      
      const updatedSettings: DeliverySettings = {
        ...settings,
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };
      
      // Always save to localStorage first
      setSettings(updatedSettings);
      saveToLocalStorage(updatedSettings);
      
      const isAuth = await checkAuth();
      
      if (isAuth && newSettings.fee) {
        try {
          console.log('Updating delivery fee in Supabase...');
          
          // First try to get existing company settings
          const { data: existingSettings } = await supabase
            .from('company_settings')
            .select('id, whatsapp_number')
            .limit(1)
            .maybeSingle();

          // Prepare data ensuring whatsapp_number is provided
          const supabaseData = {
            delivery_fee: parseFloat(newSettings.fee),
            whatsapp_number: existingSettings?.whatsapp_number || ''
          };

          if (existingSettings?.id) {
            // Update existing record
            const { error } = await supabase
              .from('company_settings')
              .update(supabaseData)
              .eq('id', existingSettings.id);

            if (error) throw error;
            console.log('Delivery fee updated in Supabase');
          } else {
            // Insert new record
            const { error } = await supabase
              .from('company_settings')
              .insert([supabaseData]);

            if (error) throw error;
            console.log('New company settings created in Supabase with delivery fee');
          }
        } catch (supabaseError) {
          console.error('Error updating Supabase, but localStorage saved:', supabaseError);
          // Don't throw error here, localStorage is already saved
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      setError(error instanceof Error ? error.message : 'Error updating delivery settings');
      return false;
    }
  };

  return {
    settings,
    loading,
    error,
    isAuthenticated,
    updateSettings,
    refetch: fetchSettings
  };
};
