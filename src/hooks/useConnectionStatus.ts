import { useState, useEffect } from 'react';
import { testNetworkConnection, testRailwayConnection } from '../utils/NetworkTest';

export interface ConnectionStatus {
  isConnected: boolean;
  connectionType: 'local' | 'railway' | 'none';
  isLoading: boolean;
}

export const useConnectionStatus = (): ConnectionStatus => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    connectionType: 'none',
    isLoading: true,
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true }));

    try {
      // Test Railway connection first (production)
      // Add timeout to prevent hanging
      const railwayTestPromise = testRailwayConnection();
      const railwayTest = await Promise.race([
        railwayTestPromise,
        new Promise<{success: boolean, url?: string, error?: string}>((resolve) => 
          setTimeout(() => resolve({ success: false, error: 'Timeout' }), 5000)
        )
      ]);
      
      if (railwayTest.success) {
        setStatus({
          isConnected: true,
          connectionType: 'railway',
          isLoading: false,
        });
        return;
      }

      // Fallback to local connection only if Railway fails
      // Skip localhost test on Android (it doesn't work)
      const localTestPromise = testNetworkConnection();
      const localTest = await Promise.race([
        localTestPromise,
        new Promise<{success: boolean, url?: string, error?: string}>((resolve) => 
          setTimeout(() => resolve({ success: false, error: 'Timeout' }), 3000)
        )
      ]);
      
      if (localTest.success) {
        setStatus({
          isConnected: true,
          connectionType: 'local',
          isLoading: false,
        });
        return;
      }

      // No connection
      setStatus({
        isConnected: false,
        connectionType: 'none',
        isLoading: false,
      });
    } catch (error) {
      console.error('Connection check failed:', error);
      // Always set status to prevent hanging
      setStatus({
        isConnected: false,
        connectionType: 'none',
        isLoading: false,
      });
    }
  };

  return status;
};
