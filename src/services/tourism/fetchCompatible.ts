
// A compatibility wrapper for fetch that works across different environments
// This helps handle browser compatibility issues and supports timeout functionality

/**
 * A fetch wrapper that supports various environments and configurations
 * @param url - The URL to fetch from
 * @param options - Standard fetch options
 * @returns Promise with the fetch response
 */
export const fetchCompatible = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    // Use native fetch API
    return await fetch(url, options);
  } catch (error) {
    console.error("Error in fetchCompatible:", error);
    throw error;
  }
};

/**
 * Fetch with timeout functionality
 * @param fetchPromise - The fetch promise to apply timeout to
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise with the fetch response
 */
export const fetchWithTimeout = async (fetchPromise: Promise<Response>, timeoutMs: number): Promise<Response> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
};

/**
 * Check if an API endpoint is available
 * @param endpoint - Optional specific endpoint to check
 * @returns Promise<boolean> indicating if API is available
 */
export const checkApiAvailability = async (endpoint?: string): Promise<boolean> => {
  const apiUrl = endpoint || 'https://api-turismo-ms.vercel.app';
  
  const endpointsToTry = [
    `${apiUrl}/api/tourism/healthcheck`,
    `${apiUrl}/api/tourism/data`,
    `${apiUrl}/api/health`,
    `${apiUrl}/health`,
  ];
  
  console.log(`Verificando disponibilidade do endpoint: ${apiUrl}`);
  
  for (const endpoint of endpointsToTry) {
    try {
      console.log(`Verificando disponibilidade do endpoint: ${endpoint}`);
      const response = await fetchWithTimeout(
        fetchCompatible(endpoint, { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        5000 // 5 second timeout
      );
      
      if (response.ok) {
        console.log(`Endpoint disponível: ${endpoint}`);
        return true;
      }
    } catch (error) {
      console.warn(`Erro ao verificar endpoint ${endpoint}:`, error);
    }
  }
  
  console.warn("Nenhum endpoint da API está acessível");
  return false;
};
