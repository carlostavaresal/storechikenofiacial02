import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorState {
  error: string | null;
  isLoading: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let errorMessage = customMessage || 'Ocorreu um erro inesperado';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Error handled:', error);
    
    setErrorState({
      error: errorMessage,
      isLoading: false
    });

    toast({
      title: "Erro",
      description: errorMessage,
      variant: "destructive"
    });

    return errorMessage;
  }, [toast]);

  const clearError = useCallback(() => {
    setErrorState({ error: null, isLoading: false });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setErrorState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      setLoading(false);
      return result;
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    }
  }, [handleError, clearError, setLoading]);

  return {
    error: errorState.error,
    isLoading: errorState.isLoading,
    handleError,
    clearError,
    setLoading,
    executeAsync
  };
};