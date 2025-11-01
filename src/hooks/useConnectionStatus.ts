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
      const railwayTest = await testRailwayConnection();
      if (railwayTest.success) {
        setStatus({
          isConnected: true,
          connectionType: 'railway',
          isLoading: false,
        });
        return;
      }

      // Fallback to local connection only if Railway fails
      const localTest = await testNetworkConnection();
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
      setStatus({
        isConnected: false,
        connectionType: 'none',
        isLoading: false,
      });
    }
  };

  return status;
};
