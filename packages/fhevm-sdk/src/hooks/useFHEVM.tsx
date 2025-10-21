/**
 * React hooks for FHEVM
 * Provides context and hooks for FHE operations in React applications
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FhevmInstance } from 'fhevmjs';
import { createFHEVMInstance, resetInstance } from '../core/fhevm';
import type { FHEVMConfig } from '../core/fhevm';

interface FHEVMContextValue {
  instance: FhevmInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: (config: FHEVMConfig) => Promise<void>;
  reset: () => void;
}

const FHEVMContext = createContext<FHEVMContextValue | undefined>(undefined);

interface FHEVMProviderProps {
  children: ReactNode;
  config?: FHEVMConfig;
  autoInit?: boolean;
}

/**
 * Provider component for FHEVM context
 */
export function FHEVMProvider({ children, config, autoInit = false }: FHEVMProviderProps) {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = async (initConfig: FHEVMConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const fhevmInstance = await createFHEVMInstance(initConfig);
      setInstance(fhevmInstance);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHEVM initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    resetInstance();
    setInstance(null);
    setError(null);
  };

  // Auto-initialize if config provided
  useEffect(() => {
    if (autoInit && config && !instance && !isLoading) {
      initialize(config);
    }
  }, [autoInit, config]);

  const value: FHEVMContextValue = {
    instance,
    isInitialized: instance !== null,
    isLoading,
    error,
    initialize,
    reset,
  };

  return <FHEVMContext.Provider value={value}>{children}</FHEVMContext.Provider>;
}

/**
 * Hook to access FHEVM context
 */
export function useFHEVM(): FHEVMContextValue {
  const context = useContext(FHEVMContext);

  if (context === undefined) {
    throw new Error('useFHEVM must be used within a FHEVMProvider');
  }

  return context;
}
