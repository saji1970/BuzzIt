// Simple network test utility
export const testNetworkConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing network connection...');
    const response = await fetch('http://127.0.0.1:3000/health');
    console.log('Network test response status:', response.status);
    const data = await response.json();
    console.log('Network test response data:', data);
    return response.ok;
  } catch (error) {
    console.error('Network test failed:', error);
    return false;
  }
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
