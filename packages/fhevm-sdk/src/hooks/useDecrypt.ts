/**
 * Hook for decrypting FHE values
 */

import { useState, useCallback } from 'react';
import { useFHEVM } from './useFHEVM';
import { decryptValue } from '../core/fhevm';
import type { Signer } from 'ethers';

interface UseDecryptReturn {
  decrypt: (contractAddress: string, ciphertext: bigint, signer: Signer) => Promise<bigint>;
  isDecrypting: boolean;
  error: Error | null;
}

/**
 * Hook for decrypting FHE encrypted values
 */
export function useDecrypt(): UseDecryptReturn {
  const { instance, isInitialized } = useFHEVM();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (contractAddress: string, ciphertext: bigint, signer: Signer): Promise<bigint> => {
      if (!isInitialized || !instance) {
        throw new Error('FHEVM not initialized. Please initialize FHEVM first.');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const decrypted = await decryptValue(contractAddress, ciphertext, signer);
        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [instance, isInitialized]
  );

  return {
    decrypt,
    isDecrypting,
    error,
  };
}
