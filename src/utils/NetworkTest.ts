// Simple network test utility
export const testNetworkConnection = async (): Promise<{success: boolean, url?: string, error?: string}> => {
  const possibleUrls = [
    'http://127.0.0.1:3000/health',
    'http://localhost:3000/health',
    'http://10.0.0.211:3000/health',
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
  
  return { success: false, error: 'All connection attempts failed' };
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
