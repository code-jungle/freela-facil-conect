// Utilitários para retry logic e timeout personalizado
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Se é o último attempt, não fazer retry
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Verificar se é erro de rede que vale a pena tentar novamente
      if (isRetryableError(error)) {
        console.log(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        // Se não é erro que vale retry, falhar imediatamente
        throw error;
      }
    }
  }
  
  throw lastError!;
};

export const isRetryableError = (error: any): boolean => {
  // Erros de rede que vale a pena tentar novamente
  const retryableMessages = [
    'network error',
    'timeout',
    'fetch failed',
    'connection refused',
    'temporary failure'
  ];
  
  const errorMessage = error?.message?.toLowerCase() || '';
  return retryableMessages.some(msg => errorMessage.includes(msg));
};

export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Operação demorou mais que o esperado')), timeoutMs)
    )
  ]);
};