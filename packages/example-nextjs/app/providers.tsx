'use client';

import { FHEVMProvider } from '@fhevm/sdk';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FHEVMProvider
      config={{
        chainId: 11155111, // Sepolia testnet
      }}
      autoInit={true}
    >
      {children}
    </FHEVMProvider>
  );
}
