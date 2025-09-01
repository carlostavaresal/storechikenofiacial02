import { useState, useEffect, useCallback } from 'react';

interface NetworkState {
  online: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
}

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  });

  const updateNetworkState = useCallback(() => {
    const connection = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
    
    setNetworkState({
      online: navigator.onLine,
      downlink: connection?.downlink,
      effectiveType: connection?.effectiveType,
      rtt: connection?.rtt
    });
  }, []);

  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch('/robots.txt', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      updateNetworkState();
    };

    const handleOffline = () => {
      setNetworkState(prev => ({ ...prev, online: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if available
    const connection = (navigator as any)?.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkState);
    }

    // Initial state
    updateNetworkState();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkState);
      }
    };
  }, [updateNetworkState]);

  return {
    ...networkState,
    checkConnectivity
  };
};