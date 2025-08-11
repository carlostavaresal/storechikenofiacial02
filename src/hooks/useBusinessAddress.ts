
import { useState, useEffect } from 'react';
import { BusinessAddress } from '@/pages/delivery/DeliveryAreas';

export const useBusinessAddress = () => {
  const [businessAddress, setBusinessAddress] = useState<BusinessAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromLocalStorage = () => {
    try {
      const savedAddress = localStorage.getItem("businessAddress");
      if (savedAddress) {
        const parsedAddress = JSON.parse(savedAddress);
        console.log('Loaded business address from localStorage:', parsedAddress);
        setBusinessAddress(parsedAddress);
        return true;
      }
    } catch (error) {
      console.error('Error loading business address from localStorage:', error);
      setError('Erro ao carregar endereço');
    }
    return false;
  };

  const saveToLocalStorage = (address: BusinessAddress) => {
    try {
      localStorage.setItem("businessAddress", JSON.stringify(address));
      console.log('Business address saved to localStorage:', address);
    } catch (error) {
      console.error('Error saving business address to localStorage:', error);
      setError('Erro ao salvar endereço');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadFromLocalStorage();
    setLoading(false);
  }, []);

  const updateAddress = (address: BusinessAddress) => {
    try {
      setError(null);
      setBusinessAddress(address);
      saveToLocalStorage(address);
      console.log('Business address updated:', address);
      return true;
    } catch (error) {
      console.error('Error updating business address:', error);
      setError('Erro ao atualizar endereço');
      return false;
    }
  };

  return {
    businessAddress,
    loading,
    error,
    updateAddress,
    refetch: loadFromLocalStorage
  };
};
