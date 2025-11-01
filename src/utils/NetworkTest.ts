// Simple network test utility
// Tests localhost as fallback (for development only)
export const testNetworkConnection = async (): Promise<{success: boolean, url?: string, error?: string}> => {
  const possibleUrls = [
    'http://127.0.0.1:3000/api/features',
    'http://localhost:3000/api/features',
  ];

  for (const url of possibleUrls) {
    try {
      console.log(`Testing local network connection to: ${url}`);
      const response = await fetch(url);
      console.log(`Local network test response status for ${url}:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Local network test response data for ${url}:`, data);
        return { success: true, url };
      }
    } catch (error) {
      console.error(`Local network test failed for ${url}:`, error);
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
      const response = await fetch(url);
      console.log(`Railway test response status for ${url}:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Railway test response data for ${url}:`, data);
        return { success: true, url };
      }
    } catch (error) {
      console.error(`Railway test failed for ${url}:`, error);
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
