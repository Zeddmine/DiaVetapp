import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  isInitialLoading: boolean;
  loadingMessage: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  triggerNavigationLoading: (message?: string, durationMs?: number) => Promise<void>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  // Initial Data Hydration Phase: Ensures localStorage data & fonts load smoothly without CLS
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const startLoading = useCallback((message?: string) => {
    setLoadingMessage(message || null);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(null);
  }, []);

  const triggerNavigationLoading = useCallback((message?: string, durationMs: number = 220) => {
    return new Promise<void>((resolve) => {
      setLoadingMessage(message || null);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage(null);
        resolve();
      }, durationMs);
    });
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        isInitialLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        triggerNavigationLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
