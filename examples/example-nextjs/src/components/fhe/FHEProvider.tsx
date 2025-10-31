'use client';

import { FHEVMProvider as SDKProvider } from '@fhevm/sdk';
import { ReactNode } from 'react';

interface FHEProviderProps {
  children: ReactNode;
  chainId?: number;
  autoInit?: boolean;
}

/**
 * FHE Provider Component
 * Wraps the application with FHEVM SDK context
 */
export function FHEProvider({
  children,
  chainId = 11155111,
  autoInit = true
}: FHEProviderProps) {
  return (
    <SDKProvider
      config={{
        chainId,
      }}
      autoInit={autoInit}
    >
      {children}
    </SDKProvider>
  );
}
