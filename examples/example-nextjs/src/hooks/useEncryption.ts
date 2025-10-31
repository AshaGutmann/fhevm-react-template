'use client';

import { useState, useCallback } from 'react';
import { useEncrypt as useSDKEncrypt } from '@fhevm/sdk';
import { FHEType } from '../lib/fhe/types';

/**
 * Enhanced encryption hook with additional features
 */
export function useEncryption() {
  const { encrypt, isEncrypting } = useSDKEncrypt();
  const [encryptionHistory, setEncryptionHistory] = useState<
    Array<{ value: number; type: FHEType; hash: string; timestamp: number }>
  >([]);

  const encryptWithHistory = useCallback(
    async (value: number, type: FHEType) => {
      const result = await encrypt(value, type);

      setEncryptionHistory(prev => [
        ...prev,
        {
          value,
          type,
          hash: result.hash,
          timestamp: Date.now(),
        },
      ]);

      return result;
    },
    [encrypt]
  );

  const clearHistory = useCallback(() => {
    setEncryptionHistory([]);
  }, []);

  return {
    encrypt: encryptWithHistory,
    isEncrypting,
    encryptionHistory,
    clearHistory,
  };
}
