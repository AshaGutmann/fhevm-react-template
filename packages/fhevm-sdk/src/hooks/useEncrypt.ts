/**
 * Hook for encrypting values with FHE
 */

import { useState, useCallback } from 'react';
import { useFHEVM } from './useFHEVM';
import { encryptValue, formatEncryptedInput } from '../core/fhevm';
import type { FHEType } from '../core/fhevm';

interface EncryptResult {
  data: Uint8Array;
  hash: string;
}

interface UseEncryptReturn {
  encrypt: (value: number | bigint | boolean, type?: FHEType) => Promise<EncryptResult>;
  isEncrypting: boolean;
  error: Error | null;
}

/**
 * Hook for encrypting values using FHE
 */
export function useEncrypt(): UseEncryptReturn {
  const { instance, isInitialized } = useFHEVM();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (value: number | bigint | boolean, type: FHEType = 'uint32'): Promise<EncryptResult> => {
      if (!isInitialized || !instance) {
        throw new Error('FHEVM not initialized. Please initialize FHEVM first.');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await encryptValue(value, type);
        const formatted = formatEncryptedInput(encrypted);
        return formatted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [instance, isInitialized]
  );

  return {
    encrypt,
    isEncrypting,
    error,
  };
}
