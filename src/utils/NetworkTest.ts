// Simple network test utility
export const testNetworkConnection = async (): Promise<{success: boolean, url?: string, error?: string}> => {
  const possibleUrls = [
    'https://buzzit-production.up.railway.app/api/features',
    'http://127.0.0.1:3000/api/features',
    'http://localhost:3000/api/features',
  ];

  for (const url of possibleUrls) {
    try {
      console.log(`Testing network connection to: ${url}`);
      const response = await fetch(url);
      console.log(`Network test response status for ${url}:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Network test response data for ${url}:`, data);
        return { success: true, url };
      }
    } catch (error) {
      console.error(`Network test failed for ${url}:`, error);
    }
  }
  
  return { success: false, error: 'All local connection attempts failed' };
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
