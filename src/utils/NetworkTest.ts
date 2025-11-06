// Simple network test utility
// Tests localhost as fallback (for development only)
import { Platform } from 'react-native';

export const testNetworkConnection = async (): Promise<{success: boolean, url?: string, error?: string}> => {
  // On Android, localhost doesn't work - skip it
  // Only test on iOS/development
  if (Platform.OS === 'android') {
    return { success: false, error: 'Local connection not available on Android' };
  }

  const possibleUrls = [
    'http://127.0.0.1:3000/api/features',
    'http://localhost:3000/api/features',
  ];

  for (const url of possibleUrls) {
    try {
      console.log(`Testing local network connection to: ${url}`);
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      console.log(`Local network test response status for ${url}:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Local network test response data for ${url}:`, data);
        return { success: true, url };
      }
    } catch (error: any) {
      // Ignore abort errors and network errors
      if (error.name !== 'AbortError') {
        console.error(`Local network test failed for ${url}:`, error);
      }
    }
  }
  
  return { success: false, error: 'Local connection failed' };
};

export const testRailwayConnection = async (): Promise<{success: boolean, url?: string, error?: string}> => {
  const railwayUrls = [
    'https://buzzit-production.up.railway.app/api/features',
    'https://buzzit-production.up.railway.app/api/buzzes',
  ];

  for (const url of railwayUrls) {
    try {
      console.log(`Testing Railway connection to: ${url}`);
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      console.log(`Railway test response status for ${url}:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Railway test response data for ${url}:`, data);
        return { success: true, url };
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error.name !== 'AbortError') {
        console.error(`Railway test failed for ${url}:`, error);
      }
    }
  }
  
  return { success: false, error: 'Railway connection failed' };
};

export const testExternalConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing external connection...');
    const response = await fetch('https://httpbin.org/get');
    console.log('External test response status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('External test failed:', error);
    return false;
  }
};
